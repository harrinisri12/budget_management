import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { ProposalStepper } from '../components/proposal/ProposalStepper';
import { Step1ProposalConfig } from '../components/proposal/Step1ProposalConfig';
import { Step2ProposalDetails } from '../components/proposal/Step2ProposalDetails';
import { Step3BudgetDetails } from '../components/proposal/Step3BudgetDetails';
import { Step4ReviewSubmit } from '../components/proposal/Step4ReviewSubmit';
import { Step5SubmissionComplete } from '../components/proposal/Step5SubmissionComplete';
import { getProposalSchema, calculateHackathonDuration } from '../config/proposalFormSchemas';
import { slugify } from '../utils/slugify';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export const NewProposalPage = () => {
  const { user } = useAuth();
  const {
    academicYears,
    fetchActiveAcademicYearConfig,
    addProposal,
    getFacultyMetrics
  } = useBudget();

  // Workflow Step State (1: Config, 2: Details, 3: Budget, 4: Review, 5: Complete)
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);

  // ---------------------------------------------------------------------------
  // Step 1: Proposal Configuration State
  // ---------------------------------------------------------------------------
  const [availableAcademicYears, setAvailableAcademicYears] = useState([]);
  const [selectedAyId, setSelectedAyId] = useState('');
  const [configuredCategories, setConfiguredCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [subcategoriesError, setSubcategoriesError] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

  // Request ID refs to prevent stale API responses from replacing newer data
  const latestAyReqId = useRef(0);
  const latestCatReqId = useRef(0);

  // Fixed Submission Date
  const [submissionDateStr] = useState(() =>
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [todayIso] = useState(() => new Date().toISOString().split('T')[0]);

  // Load subcategories strictly for a given category ID
  const loadSubcategoriesForCat = useCallback(async (catId) => {
    if (!catId) {
      setAvailableSubcategories([]);
      setSelectedSubCategoryId('');
      setSubcategoriesLoading(false);
      setSubcategoriesError('');
      return;
    }

    const reqId = ++latestCatReqId.current;
    setSubcategoriesLoading(true);
    setSubcategoriesError('');

    try {
      // 1. Primary: Load via backend API
      try {
        const res = await api.get(`/api/categories/sub-categories?categoryId=${encodeURIComponent(catId)}`);
        if (latestCatReqId.current !== reqId) return;

        if (res?.success) {
          const rawList = res.subCategories || res.subcategories || [];
          const formatted = rawList.map((s) => ({
            id: s.id,
            name: typeof s === 'string' ? s : s.name,
            categoryId: s.categoryId || s.category_id || catId
          }));
          setAvailableSubcategories(formatted);
          setSubcategoriesLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('API /api/categories/sub-categories notice, falling back to direct query:', apiErr.message);
      }

      // 2. Direct Supabase query fallback
      const { data: dbSubs, error: subErr } = await supabase
        .from('subcategories')
        .select('id, name, category_id')
        .eq('category_id', catId)
        .order('name', { ascending: true });

      if (latestCatReqId.current !== reqId) return;

      if (subErr) {
        throw new Error(subErr.message);
      }

      const formatted = (dbSubs || []).map((s) => ({
        id: s.id,
        name: s.name,
        categoryId: s.category_id || catId
      }));
      setAvailableSubcategories(formatted);
    } catch (err) {
      if (latestCatReqId.current !== reqId) return;
      console.error('Error loading subcategories:', err.message);
      setSubcategoriesError('Unable to load subcategories. Please click Retry.');
      setAvailableSubcategories([]);
    } finally {
      if (latestCatReqId.current === reqId) {
        setSubcategoriesLoading(false);
      }
    }
  }, []);

  // Load categories strictly for a given academic year ID
  const loadCategoriesForAy = useCallback(async (ayId) => {
    if (!ayId) {
      setConfiguredCategories([]);
      setSelectedCategoryId('');
      setAvailableSubcategories([]);
      setSelectedSubCategoryId('');
      setCategoriesLoading(false);
      setCategoriesError('');
      return;
    }

    const reqId = ++latestAyReqId.current;
    setCategoriesLoading(true);
    setCategoriesError('');

    try {
      // 1. Primary: Fetch categories from backend API endpoint scoped to this academic year
      try {
        const res = await api.get(`/api/categories?academicYearId=${encodeURIComponent(ayId)}`);
        if (latestAyReqId.current !== reqId) return;

        if (res?.success && Array.isArray(res.categories)) {
          const formatted = res.categories.map((c) => ({
            id: c.id,
            name: c.name,
            academicYearId: c.academicYearId || c.academic_year_id || ayId,
            budgetId: c.budgetId || c.budget_id,
            budget: Number(c.budget !== undefined ? c.budget : (c.allocatedAmount || c.allocated_amount || 0)),
            allocatedAmount: Number(c.allocatedAmount !== undefined ? c.allocatedAmount : (c.budget || c.allocated_amount || 0)),
            spentAmount: Number(c.spentAmount || c.spent_amount || 0),
            subcategories: (c.subcategories || []).map((s) => ({
              id: s.id,
              name: typeof s === 'string' ? s : s.name,
              categoryId: s.categoryId || s.category_id || c.id
            }))
          }));
          setConfiguredCategories(formatted);
          setCategoriesLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('API /api/categories notice, falling back to direct database query:', apiErr.message);
      }

      // 2. Direct Supabase query scoped strictly to this academic year
      const { data: dbCats, error: catErr } = await supabase
        .from('budget_categories')
        .select('id, budget_id, academic_year_id, name, allocated_amount, spent_amount, created_at, subcategories(id, name, category_id)')
        .eq('academic_year_id', ayId)
        .order('name', { ascending: true });

      if (latestAyReqId.current !== reqId) return;

      if (catErr) {
        throw new Error(catErr.message);
      }

      const formatted = (dbCats || []).map((c) => ({
        id: c.id,
        name: c.name,
        academicYearId: c.academic_year_id || ayId,
        budgetId: c.budget_id,
        budget: Number(c.allocated_amount || 0),
        allocatedAmount: Number(c.allocated_amount || 0),
        spentAmount: Number(c.spent_amount || 0),
        subcategories: (c.subcategories || []).map((s) => ({
          id: s.id,
          name: typeof s === 'string' ? s : s.name,
          categoryId: s.category_id || c.id
        }))
      }));
      setConfiguredCategories(formatted);
    } catch (err) {
      if (latestAyReqId.current !== reqId) return;
      console.error('Could not load categories for academic year:', err.message);
      setCategoriesError('Unable to load categories for the selected academic year. Please click Retry.');
      setConfiguredCategories([]);
    } finally {
      if (latestAyReqId.current === reqId) {
        setCategoriesLoading(false);
      }
    }
  }, []);

  // Load available academic years from backend API / database
  const loadAcademicYears = useCallback(async () => {
    try {
      // 1. Primary: Load via backend API
      try {
        const res = await api.get('/api/academic-years');
        if (res?.success && Array.isArray(res.academicYears) && res.academicYears.length > 0) {
          const list = res.academicYears.map((ay) => ({
            id: ay.id,
            academicYear: ay.academicYear || ay.academic_year || ay.name,
            name: ay.name || ay.academicYear || ay.academic_year,
            budget: Number(ay.budget !== undefined ? ay.budget : (ay.annualBudget || 0)),
            annualBudget: Number(ay.annualBudget !== undefined ? ay.annualBudget : (ay.budget || 0)),
            isActive: Boolean(ay.isActive || ay.is_active || ay.status === 'ACTIVE' || ay.status === 'Active'),
            status: (ay.status || 'DRAFT').toUpperCase()
          }));
          setAvailableAcademicYears(list);
          return list;
        }
      } catch (apiErr) {
        console.warn('API /api/academic-years notice, falling back to direct query:', apiErr.message);
      }

      // 2. Direct Supabase query fallback
      const { data: dbAys, error: dbErr } = await supabase
        .from('academic_years')
        .select('id, academic_year, budget, is_active, status, start_date, end_date')
        .order('created_at', { ascending: false });

      if (!dbErr && dbAys && dbAys.length > 0) {
        const formatted = dbAys.map((ay) => {
          const isAct = ay.status === 'ACTIVE' || ay.status === 'Active' || Boolean(ay.is_active);
          return {
            id: ay.id,
            academicYear: ay.academic_year,
            name: ay.academic_year,
            budget: Number(ay.budget || 0),
            annualBudget: Number(ay.budget || 0),
            isActive: isAct,
            status: isAct ? 'ACTIVE' : (ay.status || 'DRAFT')
          };
        });
        setAvailableAcademicYears(formatted);
        return formatted;
      }
    } catch (err) {
      console.error('Error loading academic years:', err);
    }
    return [];
  }, []);

  // Load academic years on mount and auto-select active cycle
  useEffect(() => {
    fetchActiveAcademicYearConfig();
    loadAcademicYears().then((years) => {
      if (years && years.length > 0) {
        const active = years.find((ay) => ay.isActive || ay.status === 'ACTIVE') || years[0];
        if (active?.id) {
          setSelectedAyId(active.id);
          loadCategoriesForAy(active.id);
        }
      }
    });
  }, [fetchActiveAcademicYearConfig, loadAcademicYears, loadCategoriesForAy]);

  // Handle academic year change
  const handleAyChange = (newAyId) => {
    setSelectedAyId(newAyId);
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setConfiguredCategories([]);
    setAvailableSubcategories([]);
    setCategoriesError('');
    setSubcategoriesError('');
    setEventData({});
    if (newAyId) {
      loadCategoriesForAy(newAyId);
    }
  };

  // Handle category change
  const handleCategoryChange = (newCatId) => {
    setSelectedCategoryId(newCatId);
    setSelectedSubCategoryId('');
    setAvailableSubcategories([]);
    setSubcategoriesError('');
    setEventData({}); // Reset dynamic activity fields
    if (newCatId) {
      loadSubcategoriesForCat(newCatId);
    }
  };

  // Handle subcategory change
  const handleSubCategoryChange = (newSubId) => {
    setSelectedSubCategoryId(newSubId);
    setEventData({}); // Reset dynamic activity fields when subcategory changes
  };

  // Selected Academic Year Object
  const currentAyObj = useMemo(() => {
    const combined = availableAcademicYears.length > 0 ? availableAcademicYears : (academicYears || []);
    return (
      combined.find((ay) => ay.id === selectedAyId) ||
      null
    );
  }, [availableAcademicYears, academicYears, selectedAyId]);

  // Selected Academic Year Label
  const selectedAcademicYearLabel = useMemo(() => {
    if (!currentAyObj) return '';
    return currentAyObj.name || currentAyObj.academicYear || `${currentAyObj.startYear}-${currentAyObj.endYear}`;
  }, [currentAyObj]);

  // Selected Category Object
  const selectedCategoryObj = useMemo(() => {
    return configuredCategories.find((c) => c.id === selectedCategoryId) || null;
  }, [configuredCategories, selectedCategoryId]);

  const selectedCategoryName = selectedCategoryObj?.name || '';

  // Selected Subcategory Object
  const selectedSubCategoryObj = useMemo(() => {
    return availableSubcategories.find((s) => s.id === selectedSubCategoryId) || null;
  }, [availableSubcategories, selectedSubCategoryId]);

  const selectedSubCategoryName = selectedSubCategoryObj?.name || '';

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
  // Step 2: Programme Details State (Mandatory Common Fields + Dynamic Fields)
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
  // Manual Hackathon Duration Entry (Hours)
  const [hackathonDurationHours, setHackathonDurationHours] = useState('');

  // Category-specific dynamic answers dictionary
  const [eventData, setEventData] = useState({});

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

  // ---------------------------------------------------------------------------
  // Step 3: Budget Details State (Single Amount Per Proposal)
  // ---------------------------------------------------------------------------
  // Funding source head is strictly and automatically derived from the Category selected in Step 1
  const fundingSource = useMemo(() => {
    return selectedCategoryName || '';
  }, [selectedCategoryName]);

  const [proposedAmount, setProposedAmount] = useState('');
  const [budgetRemarks, setBudgetRemarks] = useState('');

  // Step 3: Sanction / Reference Letter ID and Uploaded PDF File
  const [letterId, setLetterId] = useState('');
  const [letterFile, setLetterFile] = useState(null);

  // Authoritative Budget Metrics
  const metrics = (typeof getFacultyMetrics === 'function' ? getFacultyMetrics(user?.email) : null) || {};
  const allocatedQuota = Number(metrics.availableBalance || 0);
  const approvedCommittedExpenditure = Number(metrics.approvedAmount || 0);
  const currentAvailableBalance = Number(metrics.remainingBalance ?? 0);

  const totalProposedAmount = useMemo(() => {
    const val = Number(proposedAmount);
    return !isNaN(val) && val > 0 ? val : 0;
  }, [proposedAmount]);

  const hasQuotaTracking = allocatedQuota > 0 || currentAvailableBalance > 0;
  const remainingBalanceAfterProposal = currentAvailableBalance - totalProposedAmount;
  const isOverBudget = hasQuotaTracking && totalProposedAmount > currentAvailableBalance;

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

    if (!selectedCategoryId) {
      setSubmissionError('Please select a Category.');
      return;
    }

    if (availableSubcategories.length > 0 && !selectedSubCategoryId) {
      setSubmissionError('Please select a Subcategory event classification.');
      return;
    }

    if (!title.trim()) {
      setSubmissionError('Please enter the Programme Title.');
      return;
    }

    if (!programDate) {
      setSubmissionError('Please select the Programme Start Date.');
      return;
    }

    if (totalProposedAmount <= 0) {
      setSubmissionError('Please specify a valid proposed budget amount greater than ₹0.');
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
      const gName = eventData.guestName || eventData.resourcePersonName || '';
      const gDesig = eventData.guestDesignation || eventData.resourcePersonDesignation || '';
      const gOrg = eventData.guestOrg || eventData.resourcePersonOrg || '';
      const parts = [gName, gDesig, gOrg].filter(Boolean);
      formattedGuestDetails = parts.join(', ');

      // Hackathon duration calculation and manual entry resolution
      const computedHackathonDuration = activeSchema.type === 'hackathon'
        ? calculateHackathonDuration(programDate, endDate, startTime, endTime)
        : null;

      const effectiveDurationHours = (activeSchema.type === 'hackathon' && hackathonDurationHours)
        ? Number(hackathonDurationHours)
        : (computedHackathonDuration?.isValid ? computedHackathonDuration.hours : null);

      const effectiveDurationText = effectiveDurationHours
        ? `${effectiveDurationHours} Hour${effectiveDurationHours === 1 ? '' : 's'}`
        : (computedHackathonDuration?.isValid ? computedHackathonDuration.displayText : null);

      // Document details metadata (Letter ID & PDF)
      const trimmedLetterId = (letterId || '').trim();
      const documentDetails = {
        letterId: trimmedLetterId || null,
        fileName: letterFile?.name || null,
        fileSize: letterFile?.size || null,
        fileType: letterFile?.type || null,
        uploadedAt: letterFile ? new Date().toISOString() : null,
        hasDocument: Boolean(letterFile),
        storageStatus: letterFile ? 'metadata_only_no_cloud_bucket' : 'none'
      };

      // Build rich, structured event details payload
      const richEventDetails = {
        schemaType: activeSchema.type,
        categoryName: selectedCategoryName,
        subCategoryName: selectedSubCategoryName,
        letterId: trimmedLetterId || null,
        documentDetails,
        programmeDetails: {
          title: title.trim(),
          programDate,
          endDate: endDate || null,
          startTime,
          endTime,
          durationHours: effectiveDurationHours,
          duration: effectiveDurationText,
          venue,
          programmeLevel,
          audiences: selectedAudiences,
          coordinator: {
            name: coordinatorName,
            designation: coordinatorDesignation,
            contact: coordinatorContact
          }
        },
        categoryDetails: {
          ...eventData,
          ...(activeSchema.type === 'hackathon' ? {
            hackathonDurationHours: effectiveDurationHours,
            durationHours: effectiveDurationHours,
            duration: effectiveDurationText
          } : {})
        },
        fundingSource,
        budgetRemarks: budgetRemarks.trim() || null,
        totalProposedAmount,
        amount: totalProposedAmount
      };

      const payload = {
        proposalId: proposalIdPreview,
        academicYearId: selectedAyId || currentAyObj.id,
        academicYear: selectedAcademicYearLabel,
        proposalDate: todayIso,
        facultyName: user?.name || 'Faculty Member',
        facultyEmail: user?.email || 'faculty@kongu.edu',
        category: selectedCategoryName,
        categoryId: selectedCategoryId,
        subCategory: availableSubcategories.length > 0 ? selectedSubCategoryName : '',
        subcategoryId: availableSubcategories.length > 0 ? (selectedSubCategoryId || null) : null,
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
    setHackathonDurationHours('');
    setProposedAmount('');
    setBudgetRemarks('');
    setLetterId('');
    if (letterFile?.previewUrl) {
      try { URL.revokeObjectURL(letterFile.previewUrl); } catch { /* ignore */ }
    }
    setLetterFile(null);
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
              academicYears={availableAcademicYears.length > 0 ? availableAcademicYears : academicYears}
              selectedAyId={selectedAyId}
              onAyChange={handleAyChange}
              submissionDateStr={submissionDateStr}
              categories={configuredCategories}
              categoriesLoading={categoriesLoading}
              categoriesError={categoriesError}
              onReloadCategories={() => loadCategoriesForAy(selectedAyId)}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              availableSubcategories={availableSubcategories}
              subcategoriesLoading={subcategoriesLoading}
              subcategoriesError={subcategoriesError}
              onReloadSubcategories={() => loadSubcategoriesForCat(selectedCategoryId)}
              selectedSubCategoryId={selectedSubCategoryId}
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
              hackathonDurationHours={hackathonDurationHours}
              onHackathonDurationHoursChange={setHackathonDurationHours}
              eventData={eventData}
              onEventDataChange={handleEventDataChange}
              onBack={() => setCurrentStep(1)}
              onContinue={handleContinueStep2}
            />
          )}

          {/* STEP 3: Single Budget Amount Details & Sanction Document */}
          {currentStep === 3 && (
            <Step3BudgetDetails
              academicYearLabel={selectedAcademicYearLabel}
              allocatedQuota={allocatedQuota}
              approvedCommittedExpenditure={approvedCommittedExpenditure}
              availableBalance={currentAvailableBalance}
              proposedAmount={proposedAmount}
              onProposedAmountChange={setProposedAmount}
              fundingCategory={selectedCategoryName}
              categoryBudget={selectedCategoryObj?.budget || selectedCategoryObj?.allocatedAmount || 0}
              fundingSource={fundingSource}
              budgetRemarks={budgetRemarks}
              onBudgetRemarksChange={setBudgetRemarks}
              letterId={letterId}
              onLetterIdChange={setLetterId}
              letterFile={letterFile}
              onLetterFileChange={setLetterFile}
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
              hackathonDurationHours={hackathonDurationHours}
              letterId={letterId}
              letterFile={letterFile}
              eventData={eventData}
              fundingSource={fundingSource}
              budgetRemarks={budgetRemarks}
              proposedAmount={totalProposedAmount}
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
