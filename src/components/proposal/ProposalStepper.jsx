import React from 'react';
import { Check } from 'lucide-react';

export const STEPS = [
  { id: 1, title: 'Academic Year & Category', shortTitle: 'Configuration', sub: 'Academic Year & Categories' },
  { id: 2, title: 'Proposal Details & Budget', shortTitle: 'Details & Budget', sub: 'Specifications & Budget' },
  { id: 3, title: 'Review & Submit', shortTitle: 'Review & Submit', sub: 'Pre-Submission & Acknowledgement' }
];

export const ProposalStepper = ({
  currentStep,
  onStepClick,
  maxStepReached = 1,
  isSubmitted = false
}) => {
  return (
    <div className="cbm-stepper-container" aria-label="Proposal Submission Progress">
      <div className="cbm-stepper-track">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep || (step.id === 3 && isSubmitted);
          const isActive = step.id === currentStep && !isSubmitted;
          const isClickable = step.id <= maxStepReached && !isSubmitted;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`cbm-step-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                <div className={`cbm-step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  {isCompleted ? <Check size={12} strokeWidth={2.6} /> : step.id}
                </div>
                <div className="cbm-step-meta">
                  <span className="cbm-step-title">{step.title}</span>
                  <span className="cbm-step-sub">{step.sub}</span>
                </div>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`cbm-step-connector ${step.id < currentStep || (step.id === 2 && currentStep === 3 && isSubmitted) ? 'completed' : ''}`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

