import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { ProposalStepper } from '../components/proposal/ProposalStepper';
import { Step1ProposalConfig } from '../components/proposal/Step1ProposalConfig';
import { Step2ProposalDetails } from '../components/proposal/Step2ProposalDetails';
import { Step3BudgetDetails } from '../components/proposal/Step3BudgetDetails';
import { Step4ReviewSubmit } from '../components/proposal/Step4ReviewSubmit';
import { Step5SubmissionComplete } from '../components/proposal/Step5SubmissionComplete';
import { getProposalSchema } from '../config/proposalFormSchemas';
import { slugify } from '../utils/slugify';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export const NewProposalPage = () => {
  const { user } = useAuth();
  const {
    academicYears,
    activeAcademicYear,
    fetchActiveAcademicYearConfig,
    fetchAcademicYearDetails,
    addProposal,
    getFacultyMetrics
  } = useBudget();

  // Workflow Step State (1: Config, 2: Details, 3: Budget, 4: Review, 5: Complete)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // ---------------------------------------------------------------------------
  // Step 1: Proposal Configuration State
  // ---------------------------------------------------------------------------
  const [selectedAyId, setSelectedAyId] = useState('');
  const [configuredCategories, setConfiguredCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState('');

  // Fixed Submission Date
  const [submissionDateStr] = useState(() =>
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);

  // Determine active academic year object
  const activeAy = useMemo(() => {
    if (activeAcademicYear && (activeAcademicYear.status === 'ACTIVE' || activeAcademicYear.isActive)) {
      return activeAcademicYear;
    }
    return (academicYears || []).find((ay) => ay.status === 'ACTIVE' || ay.isActive) || null;
  }, [activeAcademicYear, academicYears]);

  // Initialize selectedAyId from active academic year
  useEffect(() => {
    if (activeAy && !selectedAyId) {
      setSelectedAyId(activeAy.id);
    }
  }, [activeAy, selectedAyId]);

  // Load active academic year config on mount
  useEffect(() => {
    fetchActiveAcademicYearConfig();
  }, [fetchActiveAcademicYearConfig]);

  // Function to load categories and subcategories for the selected academic year
  const loadCategoriesForAy = useCallback(
    async (ayId) => {
      if (!ayId) return;
      setCategoriesLoading(true);
      setCategoriesError('');

      try {
        // 1. Try activeAcademicYear in context if matches
        if (activeAcademicYear && activeAcademicYear.id === ayId && activeAcademicYear.categories?.length > 0) {
          setConfiguredCategories(activeAcademicYear.categories);
          setCategoriesLoading(false);
          return;
        }

        // 2. Try fetching academic year details from API
        if (fetchAcademicYearDetails) {
          const ayDetails = await fetchAcademicYearDetails(ayId);
          if (ayDetails && ayDetails.categories && ayDetails.categories.length > 0) {
            setConfiguredCategories(ayDetails.categories);
            setCategoriesLoading(false);
            return;
          }
        }

        // 3. Fallback to direct Supabase query
        const { data: dbCats, error: catErr } = await supabase
          .from('budget_categories')
          .select('*, subcategories(*)')
          .eq('academic_year_id', ayId)
          .order('name', { ascending: true });

        if (catErr) {
          throw new Error(catErr.message);
        }

        if (dbCats && dbCats.length > 0) {
          const formatted = dbCats.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            budget: Number(c.allocated_amount || 0),
            allocated_amount: Number(c.allocated_amount || 0),
            spent_amount: Number(c.spent_amount || 0),
            subcategories: (c.subcategories || []).map((s) => ({
              id: s.id,
              name: s.name,
              categoryId: s.category_id
            }))
          }));
          setConfiguredCategories(formatted);
        } else {
          // If no categories for that specific academic year, fallback to active academic year categories
          if (activeAy && activeAy.categories && activeAy.categories.length > 0) {
            setConfiguredCategories(activeAy.categories);
          } else {
            setConfiguredCategories([]);
          }
        }
      } catch (err) {
        console.warn('Could not load categories for academic year:', err.message);
        setCategoriesError('Unable to load categories for the selected academic year.');
        if (activeAy && activeAy.categories) {
          setConfiguredCategories(activeAy.categories);
        }
      } finally {
        setCategoriesLoading(false);
      }
    },
    [activeAcademicYear, activeAy, fetchAcademicYearDetails]
  );

  // Reload categories whenever selectedAyId changes
  useEffect(() => {
    if (selectedAyId) {
      loadCategoriesForAy(selectedAyId);
    }
  }, [selectedAyId, loadCategoriesForAy]);

  // Selected Academic Year Object
  const currentAyObj = useMemo(() => {
    return (
      (academicYears || []).find((ay) => ay.id === selectedAyId) ||
      activeAy ||
      null
    );
  }, [academicYears, selectedAyId, activeAy]);

  // Selected Academic Year Label
  const selectedAcademicYearLabel = useMemo(() => {
    if (!currentAyObj) return 'Academic Year';
    return currentAyObj.name || currentAyObj.academicYear || `${currentAyObj.startYear}-${currentAyObj.endYear}`;
  }, [currentAyObj]);

  // Synchronize category selection when categories change
  useEffect(() => {
    if (configuredCategories.length > 0) {
      const exists = configuredCategories.some((c) => c.name === selectedCategoryName);
      if (!exists) {
        const firstCat = configuredCategories[0];
        setSelectedCategoryName(firstCat.name);
        const subs = firstCat.subcategories || [];
        setSelectedSubCategoryName(subs.length > 0 ? subs[0].name : '');
      }
    } else {
      setSelectedCategoryName('');
      setSelectedSubCategoryName('');
    }
  }, [configuredCategories, selectedCategoryName]);

  // Selected Category Object
  const selectedCategoryObj = useMemo(() => {
    return configuredCategories.find((c) => c.name === selectedCategoryName) || null;
  }, [configuredCategories, selectedCategoryName]);

  // Available Subcategories for currently selected Category
  const availableSubcategories = useMemo(() => {
    return selectedCategoryObj?.subcategories || [];
  }, [selectedCategoryObj]);

  // Synchronize subcategory selection when availableSubcategories changes
  useEffect(() => {
    if (availableSubcategories.length > 0) {
      const exists = availableSubcategories.some((s) => s.name === selectedSubCategoryName);
      if (!exists) {
        setSelectedSubCategoryName(availableSubcategories[0].name);
      }
    } else {
      setSelectedSubCategoryName('');
    }
  }, [availableSubcategories, selectedSubCategoryName]);

  // Handle academic year change
  const handleAyChange = (newAyId) => {
    setSelectedAyId(newAyId);
    setSelectedCategoryName('');
    setSelectedSubCategoryName('');
    setEventData({});
    setRepeatableEvents([]);
  };

  // Handle category change
  const handleCategoryChange = (newCatName) => {
    setSelectedCategoryName(newCatName);
    const catObj = configuredCategories.find((c) => c.name === newCatName);
    const subs = catObj?.subcategories || [];
    setSelectedSubCategoryName(subs.length > 0 ? subs[0].name : '');
    setEventData({});
    setRepeatableEvents([]);
  };

  // Handle subcategory change
  const handleSubCategoryChange = (newSubName) => {
    setSelectedSubCategoryName(newSubName);
    setEventData({});
    setRepeatableEvents([]);
  };

  // ---------------------------------------------------------------------------
  // Dynamic Schema Resolution (Category & Subcategory)
  // ---------------------------------------------------------------------------
  const activeSchema = useMemo(() => {
    return getProposalSchema(selectedCategoryName, selectedSubCategoryName);
  }, [selectedCategoryName, selectedSubCategoryName]);

  // Proposal ID Preview matching institutional numbering: KEC/{AY}/{CAT}/{SUBCAT}/(assigned on submit)
  const proposalIdPreview = useMemo(() => {
    if (!currentAyObj) return 'KEC/NO-SESSION/(pending)';
    const compactAy = selectedAcademicYearLabel.replace(/\s+/g, '');
    const catSlug = slugify(selectedCategoryName || 'GENERAL');
    const subCatSlug = slugify(selectedSubCategoryName);

    if (subCatSlug) {
      return `KEC/${compactAy}/${catSlug}/${subCatSlug}/(assigned on submit)`;
    }
    return `KEC/${compactAy}/${catSlug}/(assigned on submit)`;
  }, [currentAyObj, selectedAcademicYearLabel, selectedCategoryName, selectedSubCategoryName]);

  // ---------------------------------------------------------------------------
  // Step 2: Programme Details State
  // ---------------------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:30');
  const [venue, setVenue] = useState('CC3 Seminar Hall');
  const [programmeLevel, setProgrammeLevel] = useState('Department');
  const [selectedAudiences, setSelectedAudiences] = useState(['Students (UG)']);
  const [coordinatorName, setCoordinatorName] = useState(user?.name || '');
  const [coordinatorDesignation, setCoordinatorDesignation] = useState(
    user?.designation || (user?.role === 'hod' ? 'HOD' : 'Assistant Professor')
  );
  const [coordinatorContact, setCoordinatorContact] = useState(user?.phone || '');

  // Category-specific answers dictionary
  const [eventData, setEventData] = useState({});

  // Repeatable Events (for Releases / Renaissance / Crecita / Presidential Events)
  const [repeatableEvents, setRepeatableEvents] = useState([
    {
      id: 'event-1',
      eventName: '',
      eventDate: '',
      venue: '',
      eventDescription: ''
    }
  ]);

  const handleToggleAudience = (audienceName) => {
    setSelectedAudiences((prev) =>
      prev.includes(audienceName)
        ? prev.filter((a) => a !== audienceName)
        : [...prev, audienceName]
    );
  };

  const handleEventDataChange = (key, value) => {
    setEventData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddRepeatableEvent = () => {
    setRepeatableEvents((prev) => [
      ...prev,
      {
        id: `event-${Date.now()}`,
        eventName: '',
        eventDate: programDate || '',
        venue: venue || '',
        eventDescription: ''
      }
    ]);
  };

  const handleRemoveRepeatableEvent = (id) => {
    setRepeatableEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleRepeatableEventChange = (id, field, value) => {
    setRepeatableEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev))
    );
  };

  // ---------------------------------------------------------------------------
  // Step 3: Budget & Expenditure State (Repeatable Expense Table)
  // ---------------------------------------------------------------------------
  const [fundingSource, setFundingSource] = useState('Department Budget Allocation');
  const [budgetRemarks, setBudgetRemarks] = useState('');

  // Update default funding source when schema changes
  useEffect(() => {
    if (activeSchema?.defaultFundingSource) {
      setFundingSource(activeSchema.defaultFundingSource);
    }
  }, [activeSchema]);

  const [expenses, setExpenses] = useState([
    {
      id: 'exp-1',
      purpose: 'Remuneration / Honorarium for Resource Person',
      proposedAmount: 10000,
      revisedAmount: '',
      actualAmount: '',
      remarks: 'Standard institutional honorarium'
    },
    {
      id: 'exp-2',
      purpose: 'Travel Allowance (TA) / Conveyance',
      proposedAmount: 5000,
      revisedAmount: '',
      actualAmount: '',
      remarks: 'Local conveyance & airport transit'
    },
    {
      id: 'exp-3',
      purpose: 'Refreshments, Working Lunch & Tea',
      proposedAmount: 3500,
      revisedAmount: '',
      actualAmount: '',
      remarks: 'Participant refreshments & lunch'
    }
  ]);

  const handleAddExpense = (initialPurpose = '') => {
    setExpenses((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}`,
        purpose: initialPurpose || '',
        proposedAmount: '',
        revisedAmount: '',
        actualAmount: '',
        remarks: ''
      }
    ]);
  };

  const handleRemoveExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // Authoritative Budget Metrics
  const metrics = getFacultyMetrics(user?.email);
  const allocatedQuota = metrics.availableBalance || 150000;
  const approvedCommittedExpenditure = metrics.approvedAmount || 0;
  const currentAvailableBalance = metrics.remainingBalance || 150000;

  const totalProposedAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.proposedAmount) || 0), 0);
  }, [expenses]);

  const remainingBalanceAfterProposal = currentAvailableBalance - totalProposedAmount;
  const isOverBudget = totalProposedAmount > currentAvailableBalance;

  // ---------------------------------------------------------------------------
  // Step 4: Submission State & Handler
  // ---------------------------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submittedProposal, setSubmittedProposal] = useState(null);

  const handleSubmitProposal = async () => {
    setSubmissionError('');

    if (!currentAyObj) {
      setSubmissionError('Active academic year is missing. Please contact the administrator.');
      return;
    }

    if (!selectedCategoryName) {
      setSubmissionError('Please select a funding Category.');
      return;
    }

    if (!title.trim()) {
      setSubmissionError('Please enter the Programme Title.');
      return;
    }

    if (!programDate) {
      setSubmissionError('Please select the Programme Date.');
      return;
    }

    if (totalProposedAmount <= 0) {
      setSubmissionError('Please specify proposed expenditure amounts greater than ₹0.');
      return;
    }

    if (isOverBudget) {
      setSubmissionError('Insufficient balance. Proposed amount exceeds your permitted remaining quota.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build formatted guest string for backwards compatibility
      let formattedGuestDetails = '';
      if (activeSchema.requiresGuestDetails) {
        const gName = eventData.guestName || eventData.resourcePersonName || '';
        const gDesig = eventData.guestDesignation || eventData.resourcePersonDesignation || '';
        const gOrg = eventData.guestOrg || eventData.resourcePersonOrg || '';
        const parts = [gName, gDesig, gOrg].filter(Boolean);
        formattedGuestDetails = parts.join(', ');
      }

      // Find subcategory UUID if available
      const selectedSubObj = availableSubcategories.find((s) => s.name === selectedSubCategoryName);

      // Build rich, structured event details payload
      const richEventDetails = {
        schemaType: activeSchema.type,
        programmeDetails: {
          title: title.trim(),
          programDate,
          endDate: endDate || null,
          startTime,
          endTime,
          venue,
          programmeLevel,
          audiences: selectedAudiences,
          coordinator: {
            name: coordinatorName,
            designation: coordinatorDesignation,
            contact: coordinatorContact
          }
        },
        categoryDetails: { ...eventData },
        repeatableEvents: activeSchema.hasRepeatableEvents ? repeatableEvents : [],
        expenses: expenses.map((e, idx) => ({
          sno: idx + 1,
          purpose: e.purpose,
          proposedAmount: Number(e.proposedAmount) || 0,
          revisedAmount: null,
          actualAmount: null,
          remarks: e.remarks || ''
        })),
        fundingSource,
        budgetRemarks,
        financialComputation: {
          allocatedQuota,
          approvedCommittedExpenditure,
          availableBalanceBefore: currentAvailableBalance,
          totalProposedAmount,
          remainingBalanceAfter: remainingBalanceAfterProposal
        }
      };

      const payload = {
        proposalId: proposalIdPreview,
        academicYearId: currentAyObj.id,
        academicYear: selectedAcademicYearLabel,
        proposalDate: todayIso,
        facultyName: user?.name || 'Faculty Member',
        facultyEmail: user?.email || 'faculty@kongu.edu',
        category: selectedCategoryName,
        categoryId: selectedCategoryObj?.id || null,
        subCategory: availableSubcategories.length > 0 ? selectedSubCategoryName : '',
        subcategoryId: selectedSubObj?.id || null,
        title: title.trim(),
        programDate,
        guestDetails: formattedGuestDetails,
        eventDetails: richEventDetails,
        amount: totalProposedAmount
      };

      const result = await addProposal(payload);

      if (result.success) {
        setSubmittedProposal(result.proposal);
        setCurrentStep(5);
        setMaxStepReached(5);
      } else {
        setSubmissionError(result.error || 'Failed to submit proposal. Please check the entered data.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionError(err.message || 'Error communicating with server during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to start a new proposal
  const handleResetForm = () => {
    setTitle('');
    setProgramDate('');
    setEndDate('');
    setStartTime('10:00');
    setEndTime('12:30');
    setVenue('CC3 Seminar Hall');
    setSelectedAudiences(['Students (UG)']);
    setEventData({});
    setRepeatableEvents([
      { id: 'event-1', eventName: '', eventDate: '', venue: '', eventDescription: '' }
    ]);
    setBudgetRemarks('');
    setExpenses([
      {
        id: 'exp-1',
        purpose: 'Remuneration / Honorarium for Resource Person',
        proposedAmount: 10000,
        revisedAmount: '',
        actualAmount: '',
        remarks: 'Standard institutional honorarium'
      }
    ]);
    setSubmittedProposal(null);
    setSubmissionError('');
    setCurrentStep(1);
    setMaxStepReached(1);
  };

  // Stepper click handler
  const handleStepClick = (stepId) => {
    if (stepId <= maxStepReached && stepId !== 5 && currentStep !== 5) {
      setCurrentStep(stepId);
    }
  };

  const handleContinueStep1 = () => {
    setCurrentStep(2);
    setMaxStepReached((prev) => Math.max(prev, 2));
  };

  const handleContinueStep2 = () => {
    setCurrentStep(3);
    setMaxStepReached((prev) => Math.max(prev, 3));
  };

  const handleContinueStep3 = () => {
    setCurrentStep(4);
    setMaxStepReached((prev) => Math.max(prev, 4));
  };

  return (
    <FacultyLayout pageTitle="New Proposal">
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Page Title & Institutional Heading */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-heading)' }}>
            Submit Programme Budget Proposal
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 3 }}>
            Multi-step dynamic proposal submission workflow for Computer Science and Engineering, Kongu Engineering College.
          </p>
        </div>

        <hr className="cbm-divider" />

        {/* Horizontal 5-Step Progress Stepper */}
        <ProposalStepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
          maxStepReached={maxStepReached}
        />

        {/* STEP CONTENT CONTAINER */}
        <div>
          {/* STEP 1: Academic Year & Category Selection */}
          {currentStep === 1 && (
            <Step1ProposalConfig
              academicYears={academicYears}
              selectedAyId={selectedAyId}
              onAyChange={handleAyChange}
              submissionDateStr={submissionDateStr}
              categories={configuredCategories}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
              onReloadCategories={() => loadCategoriesForAy(selectedAyId)}
              selectedCategoryName={selectedCategoryName}
              onCategoryChange={handleCategoryChange}
              availableSubcategories={availableSubcategories}
              selectedSubCategoryName={selectedSubCategoryName}
              onSubCategoryChange={handleSubCategoryChange}
              onContinue={handleContinueStep1}
            />
          )}

          {/* STEP 2: Dynamically Generated Proposal Details */}
          {currentStep === 2 && (
            <Step2ProposalDetails
              proposalIdPreview={proposalIdPreview}
              categoryName={selectedCategoryName}
              subCategoryName={selectedSubCategoryName}
              schema={activeSchema}
              title={title}
              onTitleChange={setTitle}
              programDate={programDate}
              onProgramDateChange={setProgramDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              endTime={endTime}
              onEndTimeChange={setEndTime}
              venue={venue}
              onVenueChange={setVenue}
              programmeLevel={programmeLevel}
              onProgrammeLevelChange={setProgrammeLevel}
              selectedAudiences={selectedAudiences}
              onToggleAudience={handleToggleAudience}
              coordinatorName={coordinatorName}
              onCoordinatorNameChange={setCoordinatorName}
              coordinatorDesignation={coordinatorDesignation}
              onCoordinatorDesignationChange={setCoordinatorDesignation}
              coordinatorContact={coordinatorContact}
              onCoordinatorContactChange={setCoordinatorContact}
              eventData={eventData}
              onEventDataChange={handleEventDataChange}
              repeatableEvents={repeatableEvents}
              onAddRepeatableEvent={handleAddRepeatableEvent}
              onRemoveRepeatableEvent={handleRemoveRepeatableEvent}
              onRepeatableEventChange={handleRepeatableEventChange}
              onBack={() => setCurrentStep(1)}
              onContinue={handleContinueStep2}
            />
          )}

          {/* STEP 3: Budget & Repeatable Expenditure Details */}
          {currentStep === 3 && (
            <Step3BudgetDetails
              academicYearLabel={selectedAcademicYearLabel}
              allocatedQuota={allocatedQuota}
              approvedCommittedExpenditure={approvedCommittedExpenditure}
              availableBalance={currentAvailableBalance}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onRemoveExpense={handleRemoveExpense}
              onExpenseChange={handleExpenseChange}
              fundingSource={fundingSource}
              onFundingSourceChange={setFundingSource}
              budgetRemarks={budgetRemarks}
              onBudgetRemarksChange={setBudgetRemarks}
              onBack={() => setCurrentStep(2)}
              onContinue={handleContinueStep3}
            />
          )}

          {/* STEP 4: Review & Submit */}
          {currentStep === 4 && (
            <Step4ReviewSubmit
              academicYearLabel={selectedAcademicYearLabel}
              submissionDateStr={submissionDateStr}
              categoryName={selectedCategoryName}
              subCategoryName={selectedSubCategoryName}
              proposalIdPreview={proposalIdPreview}
              schema={activeSchema}
              title={title}
              programDate={programDate}
              endDate={endDate}
              startTime={startTime}
              endTime={endTime}
              venue={venue}
              programmeLevel={programmeLevel}
              selectedAudiences={selectedAudiences}
              coordinatorName={coordinatorName}
              coordinatorDesignation={coordinatorDesignation}
              coordinatorContact={coordinatorContact}
              eventData={eventData}
              repeatableEvents={repeatableEvents}
              fundingSource={fundingSource}
              budgetRemarks={budgetRemarks}
              expenses={expenses}
              totalProposedAmount={totalProposedAmount}
              availableBalance={currentAvailableBalance}
              remainingBalance={remainingBalanceAfterProposal}
              isOverBudget={isOverBudget}
              isSubmitting={isSubmitting}
              error={submissionError}
              onEditStep={(stepNum) => setCurrentStep(stepNum)}
              onBack={() => setCurrentStep(3)}
              onSubmit={handleSubmitProposal}
            />
          )}

          {/* STEP 5: Submission Complete */}
          {currentStep === 5 && (
            <Step5SubmissionComplete
              submittedProposal={submittedProposal}
              academicYearLabel={selectedAcademicYearLabel}
              onResetForm={handleResetForm}
            />
          )}
        </div>
      </div>
    </FacultyLayout>
  );
};
