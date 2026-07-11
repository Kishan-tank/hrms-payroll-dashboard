import Onboarding from '../models/Onboarding.js';

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

// ─── Get or initialize onboarding state for logged-in user ─────────────────────
export const getOnboardingState = async (req, res) => {
  try {
    let onboarding = await Onboarding.findOne({ userId: req.user.id });

    if (!onboarding) {
      onboarding = await Onboarding.create({
        userId: req.user.id,
        steps: DEFAULT_STEPS,
        currentStepId: 'profile',
      });
    }

    res.status(200).json({ success: true, onboarding });
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
      { steps: DEFAULT_STEPS, currentStepId: 'profile', completedAt: null },
      { new: true }
    );

    res.status(200).json({ success: true, onboarding });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Employee from '../models/employee.js';

export const saveProfile = async (req, res) => {
  try {
    const { phone, dob, gender, address } = req.body;
    await Employee.findOneAndUpdate(
      { $or: [{ userId: req.user.id }, { email: req.user.email }] },
      { phone, dob, gender, address },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Profile saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveBank = async (req, res) => {
  try {
    const { account, ifsc, bankName } = req.body;
    await Employee.findOneAndUpdate(
      { $or: [{ userId: req.user.id }, { email: req.user.email }] },
      { bankAccount: account, ifscCode: ifsc, bankName },
      { new: true }
    );
    res.status(200).json({ success: true, message: 'Bank details saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import Document from '../models/Document.js';

export const uploadDocuments = async (req, res) => {
  try {
    const files = req.files; // assumes multer
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
        employeeId: req.user.id,
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
        employeeId: req.user.id,
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
        employeeId: req.user.id,
        title: files.certificates[0].originalname,
        type: 'Other',
        fileUrl: url,
        uploadedBy: req.user.id
      });
    }

    // Save to employee profile
    employee.documents = [...(employee.documents || []), ...newDocs];
    await employee.save();

    // Save to central Document collection so they appear on the Documents page
    if (documentRecords.length > 0) {
      await Document.insertMany(documentRecords);
    }

    res.status(200).json({ success: true, message: 'Documents uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
