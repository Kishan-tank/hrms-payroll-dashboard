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
