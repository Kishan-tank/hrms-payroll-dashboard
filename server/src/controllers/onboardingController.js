import Onboarding from '../models/Onboarding.js';
import Employee from '../models/employee.js';
import Document from '../models/Document.js';
import { notifyChange } from '../utils/mailer.js';
import { encryptText, maskBankAccount } from '../utils/crypto.js';

const DEFAULT_STEPS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your personal details, phone number, date of birth, and address.',
    icon: 'user-circle',
    status: 'in_progress',
  },
  {
    id: 'documents',
    title: 'Upload documents',
    description: 'Submit your government ID, offer letter acceptance, and any certificates.',
    icon: 'file-upload',
    status: 'pending',
  },
  {
    id: 'bank',
    title: 'Add bank details',
    description: 'Enter your account number, IFSC code, and bank name for payroll.',
    icon: 'building-bank',
    status: 'pending',
  },
  {
    id: 'handbook',
    title: 'Read the employee handbook',
    description: 'Review company policies, code of conduct, and leave entitlements.',
    icon: 'book',
    status: 'pending',
  },
  {
    id: 'complete',
    title: 'All set!',
    description: 'Your onboarding is complete. Welcome to the team.',
    icon: 'confetti',
    status: 'pending',
  }
];

// Helper to append activity log entries
const logActivity = async (userId, action, details) => {
  try {
    await Onboarding.findOneAndUpdate(
      { userId },
      { $push: { activityLogs: { action, timestamp: new Date(), details } } }
    );
  } catch (err) {
    console.error('Failed to log onboarding activity:', err);
  }
};

// ─── Get or initialize onboarding state for logged-in user ─────────────────────
export const getOnboardingState = async (req, res) => {
  try {
    let onboarding = await Onboarding.findOne({ userId: req.user.id })
      .populate('employeeId')
      .populate('reviewedBy', 'name email role');

    if (!onboarding) {
      const emp = await Employee.findOne({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      });

      onboarding = await Onboarding.create({
        userId: req.user.id,
        employeeId: emp ? emp._id : null,
        steps: DEFAULT_STEPS,
        currentStepId: 'profile',
        activityLogs: [{ action: 'Draft auto-saved', timestamp: new Date(), details: 'Started onboarding flow' }]
      });
    } else if (!onboarding.employeeId) {
      const emp = await Employee.findOne({
        $or: [{ userId: req.user.id }, { email: req.user.email }]
      });
      if (emp) {
        onboarding.employeeId = emp._id;
        await onboarding.save();
      }
    }

    // Convert to plain object and mask bank account for UI response
    const onboardingObj = onboarding.toObject();
    if (onboardingObj.employeeId && onboardingObj.employeeId.bankAccount) {
      onboardingObj.employeeId.maskedBankAccount = maskBankAccount(onboardingObj.employeeId.bankAccount);
    }

    res.status(200).json({ success: true, onboarding: onboardingObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update onboarding state ───────────────────────────────────────────────────
export const updateOnboardingState = async (req, res) => {
  try {
    const { steps, currentStepId, completedAt } = req.body;

    const onboarding = await Onboarding.findOneAndUpdate(
      { userId: req.user.id },
      { steps, currentStepId, completedAt },
      { new: true, upsert: true }
    );

    const completedCount = steps ? steps.filter((s) => s.status === 'completed').length : 0;
    notifyChange({
      user: req.user,
      action: "ONBOARDING_UPDATED",
      details: { completedSteps: completedCount, totalSteps: steps ? steps.length : 5 },
      actor: req.user,
    });

    res.status(200).json({ success: true, onboarding });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Reset onboarding state ────────────────────────────────────────────────────
export const resetOnboardingState = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOneAndUpdate(
      { userId: req.user.id },
      {
        steps: DEFAULT_STEPS,
        currentStepId: 'profile',
        completedAt: null,
        policyAccepted: false,
        policyAcceptedAt: null,
        reviewStatus: 'In Progress',
        reviewNotes: '',
        activityLogs: [{ action: 'Onboarding Reset', timestamp: new Date(), details: 'Reset steps to initial state' }]
      },
      { new: true }
    );

    res.status(200).json({ success: true, onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Save Personal Profile Step ────────────────────────────────────────────────
export const saveProfile = async (req, res) => {
  try {
    const { phone, dob, gender, address } = req.body;

    // Server-side required field validation
    const fieldErrors = {};
    if (!phone || !String(phone).trim()) fieldErrors.phone = 'Phone number is required';
    if (!dob) fieldErrors.dob = 'Date of birth is required';
    if (!gender || !String(gender).trim()) fieldErrors.gender = 'Gender is required';
    if (!address || !String(address).trim()) fieldErrors.address = 'Address is required';

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ success: false, message: 'All personal info fields are required', fieldErrors });
    }

    const emp = await Employee.findOneAndUpdate(
      { $or: [{ userId: req.user.id }, { email: req.user.email }] },
      { phone: String(phone).trim(), dob, gender: String(gender).trim(), address: String(address).trim() },
      { new: true }
    );

    if (emp) {
      await Onboarding.updateOne({ userId: req.user.id }, { employeeId: emp._id });
    }

    await logActivity(req.user.id, 'Profile details saved', 'Updated personal contact and address info');

    notifyChange({
      user: emp || req.user,
      action: "EMPLOYEE_PROFILE_UPDATED",
      details: { section: "Personal Information & Address" },
      actor: req.user,
    });
    res.status(200).json({ success: true, message: 'Profile saved successfully', employee: emp });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Save Bank Details Step (AES-256-GCM Encrypted at Rest) ───────────────────
export const saveBank = async (req, res) => {
  try {
    const { account, ifsc, bankName } = req.body;

    // Server-side required field validation
    const fieldErrors = {};
    if (!account || !String(account).trim()) fieldErrors.account = 'Account number is required';
    if (!ifsc || !String(ifsc).trim()) fieldErrors.ifsc = 'IFSC code is required';
    if (!bankName || !String(bankName).trim()) fieldErrors.bankName = 'Bank name is required';

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ success: false, message: 'All bank details are required', fieldErrors });
    }

    // Encrypt sensitive bank account number before persisting to DB
    const encryptedAccount = encryptText(String(account).trim());

    const emp = await Employee.findOneAndUpdate(
      { $or: [{ userId: req.user.id }, { email: req.user.email }] },
      { bankAccount: encryptedAccount, ifscCode: String(ifsc).trim().toUpperCase(), bankName: String(bankName).trim() },
      { new: true }
    );

    await logActivity(req.user.id, 'Bank details verified', `IFSC ${ifsc} verified for ${bankName}`);

    notifyChange({
      user: emp || req.user,
      action: "EMPLOYEE_PROFILE_UPDATED",
      details: { section: "Bank Account Details", bankName }, // Never log decrypted account!
      actor: req.user,
    });
    res.status(200).json({ success: true, message: 'Bank details saved successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Upload Onboarding Documents Step ──────────────────────────────────────────
export const uploadDocuments = async (req, res) => {
  try {
    const files = req.files || {};

    // All three documents are required for onboarding
    const missing = [];
    if (!files.govId) missing.push('Government ID');
    if (!files.offerLetter) missing.push('Offer Letter');
    if (!files.certificates) missing.push('Certificates');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following documents are required: ${missing.join(', ')}`,
        missingDocuments: missing
      });
    }

    const employee = await Employee.findOne({ $or: [{ userId: req.user.id }, { email: req.user.email }] });
    if (!employee) {
       return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newDocs = [];
    const documentRecords = [];

    if (files.govId) {
      const url = `/uploads/${files.govId[0].filename}`;
      newDocs.push({ type: 'gov_id', name: files.govId[0].originalname, url });
      documentRecords.push({
        employeeId: employee._id,
        title: files.govId[0].originalname,
        type: 'ID Proof',
        fileUrl: url,
        uploadedBy: req.user.id
      });
    }
    if (files.offerLetter) {
      const url = `/uploads/${files.offerLetter[0].filename}`;
      newDocs.push({ type: 'offer_letter', name: files.offerLetter[0].originalname, url });
      documentRecords.push({
        employeeId: employee._id,
        title: files.offerLetter[0].originalname,
        type: 'Offer Letter',
        fileUrl: url,
        uploadedBy: req.user.id
      });
    }
    if (files.certificates) {
      const url = `/uploads/${files.certificates[0].filename}`;
      newDocs.push({ type: 'certificate', name: files.certificates[0].originalname, url });
      documentRecords.push({
        employeeId: employee._id,
        title: files.certificates[0].originalname,
        type: 'Other',
        fileUrl: url,
        uploadedBy: req.user.id
      });
    }

    employee.documents = [...(employee.documents || []), ...newDocs];
    await employee.save();

    await Onboarding.updateOne({ userId: req.user.id }, { employeeId: employee._id });

    if (documentRecords.length > 0) {
      await Document.insertMany(documentRecords);
    }

    await logActivity(req.user.id, 'Documents uploaded', `${newDocs.length} onboarding documents uploaded`);

    res.status(200).json({ success: true, message: 'Documents uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Save Policy Acknowledgment ────────────────────────────────────────────────
export const savePolicy = async (req, res) => {
  try {
    const { agreed } = req.body;
    const timestamp = new Date();

    const onboarding = await Onboarding.findOneAndUpdate(
      { userId: req.user.id },
      { policyAccepted: agreed, policyAcceptedAt: agreed ? timestamp : null },
      { new: true }
    );

    if (agreed) {
      await logActivity(req.user.id, 'Policies accepted', 'Handbook & Code of Conduct acknowledged');
    }

    res.status(200).json({ success: true, message: 'Policy acknowledgment saved', onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Complete Onboarding Submission ───────────────────────────────────────────
export const completeOnboarding = async (req, res) => {
  try {
    // Set Employee to 'Pending Onboarding' — HR approval is the gate to 'Active'
    const emp = await Employee.findOneAndUpdate(
      { $or: [{ userId: req.user.id }, { email: req.user.email }] },
      { status: 'Pending Onboarding', isActive: false },
      { new: true }
    );

    const onboarding = await Onboarding.findOneAndUpdate(
      { userId: req.user.id },
      {
        employeeId: emp ? emp._id : undefined,
        reviewStatus: 'Pending Review',
        completedAt: new Date()
      },
      { new: true }
    );

    await logActivity(req.user.id, 'Onboarding Complete', 'Submitted full profile for HR verification');

    notifyChange({
      user: { name: "HR Team", email: process.env.ADMIN_EMAIL },
      action: "ONBOARDING_UPDATED",
      details: { employeeName: emp ? emp.name : req.user.name, reviewStatus: "Pending Review" },
      actor: req.user,
    });

    res.status(200).json({ success: true, message: 'Onboarding completed and submitted for HR review', onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── HR/Admin: Get Pending Onboarding Reviews ──────────────────────────────────
export const getPendingReviews = async (req, res) => {
  try {
    const onboardings = await Onboarding.find({
      completedAt: { $ne: null },
      reviewStatus: { $nin: ['Approved', 'Rejected'] }
    })
      .populate('userId', 'name email role')
      .populate('employeeId')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 });

    const formatted = await Promise.all(onboardings.map(async (ob) => {
      const obj = ob.toObject();

      // If employeeId reference was not populated/linked on Onboarding document,
      // resolve Employee by userId or email and auto-link it
      if (!obj.employeeId && obj.userId) {
        const userObj = obj.userId;
        const emp = await Employee.findOne({
          $or: [
            { userId: userObj._id || userObj },
            { email: userObj.email }
          ]
        }).lean();

        if (emp) {
          obj.employeeId = emp;
          // Self-heal DB record by linking employeeId
          await Onboarding.updateOne({ _id: ob._id }, { employeeId: emp._id });
        }
      }

      if (obj.completedAt && obj.reviewStatus !== 'Approved' && obj.reviewStatus !== 'Rejected') {
        obj.reviewStatus = 'Pending Review';
      }
      if (obj.employeeId && obj.employeeId.bankAccount) {
        obj.employeeId.maskedBankAccount = maskBankAccount(obj.employeeId.bankAccount);
      }
      return obj;
    }));

    res.status(200).json({ success: true, onboardings: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── HR/Admin: Review & Approve/Reject Onboarding ─────────────────────────────
export const reviewOnboarding = async (req, res) => {
  try {
    const { action, notes } = req.body; // action: 'Approve' | 'Reject'
    const { id } = req.params; // Onboarding ID or Employee ID

    let onboarding = await Onboarding.findById(id);
    if (!onboarding) {
      onboarding = await Onboarding.findOne({ employeeId: id });
    }
    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding record not found' });
    }

    const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';

    onboarding.reviewStatus = newStatus;
    onboarding.reviewNotes = notes || '';
    onboarding.reviewedBy = req.user.id;
    onboarding.reviewedAt = new Date();

    onboarding.activityLogs.push({
      action: `Review ${newStatus}`,
      timestamp: new Date(),
      details: `HR review marked as ${newStatus}${notes ? `: ${notes}` : ''}`
    });

    await onboarding.save();

    if (action === 'Approve' && onboarding.employeeId) {
      await Employee.findByIdAndUpdate(onboarding.employeeId, { status: 'Active', isActive: true });
    }

    const targetEmp = onboarding.employeeId ? await Employee.findById(onboarding.employeeId) : null;

    notifyChange({
      user: targetEmp || { name: "Employee", email: req.user.email },
      action: "ONBOARDING_UPDATED",
      details: { reviewStatus: newStatus, notes },
      actor: req.user,
    });

    res.status(200).json({ success: true, message: `Onboarding review set to ${newStatus}`, onboarding });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
