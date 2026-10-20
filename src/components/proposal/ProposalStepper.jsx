import React from 'react';
import { Check } from 'lucide-react';

export const STEPS = [
  { id: 1, title: 'Academic Year & Category', shortTitle: 'Configuration', sub: 'Academic Year & Categories' },
  { id: 2, title: 'Proposal Details', shortTitle: 'Details', sub: 'Programme Specifications' },
  { id: 3, title: 'Budget & Sanction Letter', shortTitle: 'Budget', sub: 'Budget & Reference Letter' },
  { id: 4, title: 'Review & Submit', shortTitle: 'Review', sub: 'Pre-Submission Audit' },
  { id: 5, title: 'Submission Complete', shortTitle: 'Complete', sub: 'Acknowledgement' }
];

export const ProposalStepper = ({ currentStep, onStepClick, maxStepReached = 1 }) => {
  return (
    <div className="cbm-stepper-container" aria-label="Proposal Submission Progress">
      <div className="cbm-stepper-track">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = step.id <= maxStepReached && step.id !== 5 && currentStep !== 5;

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
                  {isCompleted ? <Check size={16} strokeWidth={2.6} /> : step.id}
                </div>
                <div className="cbm-step-meta">
                  <span className="cbm-step-title">{step.title}</span>
                  <span className="cbm-step-sub">{step.sub}</span>
                </div>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`cbm-step-connector ${step.id < currentStep ? 'completed' : ''}`}
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
