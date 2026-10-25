import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useBudget } from '../context/BudgetContext';
import { api } from '../lib/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import {
  CalendarRange,
  Plus,
  Trash2,
  AlertCircle,
  Search,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit2,
  CheckCircle2,
  Layers,
  FolderPlus,
  Coins
} from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - 2 + i);

const STEPS = [
  { id: 1, label: 'Academic Year', description: 'Consecutive Period' },
  { id: 2, label: 'Categories', description: 'Name & Budget' },
  { id: 3, label: 'Subcategories', description: 'Groupings (No Budget)' },
  { id: 4, label: 'Review', description: 'Verify & Total' },
  { id: 5, label: 'Create & Save', description: 'Save Configuration' }
];

/**
 * Normalizes an academic year string into standard canonical format: "YYYY-YYYY+1" (e.g. "2027-2028")
 */
const canonicalAcademicYear = (raw) => {
  if (!raw) return '';
  const str = String(raw).trim();
  const match = str.match(/(\d{4})/);
  if (match) {
    const s = parseInt(match[1], 10);
    return `${s}-${s + 1}`;
  }
  return str.replace(/\s+/g, '').replace(/[–—/]/g, '-');
};

/**
 * Searchable Combobox Component for Add Academic Year Wizard
 * Allows selecting existing values from database or typing new entries.
 */
const Combobox = ({
  value,
  onChange,
  onSelect,
  options = [],
  excludeValues = [],
  placeholder = 'Select or type a name...',
  emptyMessage = 'No matching options found.',
  addNewPrefix = 'Add',
  addNewSuffix = 'as new',
  onEnter,
  disabled = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize excluded values for fast case-insensitive checking
  const excludedSet = useMemo(() => {
    return new Set(
      (excludeValues || []).map(v => (typeof v === 'string' ? v : v?.name || '').trim().toLowerCase())
    );
  }, [excludeValues]);

  // Normalized option objects: { name, description, subcategories, raw }
  const normalizedOptions = useMemo(() => {
    const list = [];
    const seen = new Set();
    (options || []).forEach(opt => {
      if (typeof opt === 'string') {
        const clean = opt.trim();
        const key = clean.toLowerCase();
        if (clean && !excludedSet.has(key) && !seen.has(key)) {
          seen.add(key);
          list.push({ name: clean, description: '', subcategories: [], raw: opt });
        }
      } else if (opt && typeof opt === 'object' && opt.name) {
        const clean = opt.name.trim();
        const key = clean.toLowerCase();
        if (clean && !excludedSet.has(key) && !seen.has(key)) {
          seen.add(key);
          list.push({
            name: clean,
            description: opt.description || '',
            subcategories: opt.subcategories || [],
            raw: opt
          });
        }
      }
    });
    return list;
  }, [options, excludedSet]);

  // Filtered options based on user input
  const searchTerm = (value || '').trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return normalizedOptions;
    return normalizedOptions.filter(opt => {
      const matchName = opt.name.toLowerCase().includes(searchTerm);
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(searchTerm) : false;
      return matchName || matchDesc;
    });
  }, [normalizedOptions, searchTerm]);

  // Check if exact match already exists in options
  const exactMatchExists = useMemo(() => {
    if (!searchTerm) return false;
    return (options || []).some(opt => {
      const name = typeof opt === 'string' ? opt : opt?.name || '';
      return name.trim().toLowerCase() === searchTerm;
    });
  }, [options, searchTerm]);

  // Show "Add new" option if user has typed something that isn't already added
  const showAddNew = Boolean(
    searchTerm &&
    !excludedSet.has(searchTerm) &&
    !exactMatchExists
  );

  const totalItems = filteredOptions.length + (showAddNew ? 1 : 0);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const itemEl = listRef.current.children[highlightedIndex];
      if (itemEl) {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleSelectOption = (opt) => {
    onSelect?.(opt.raw || opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectAddNew = () => {
    const clean = (value || '').trim();
    if (clean) {
      onSelect?.(clean);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => (prev + 1 < totalItems ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(totalItems - 1);
      } else {
        setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0) {
        e.preventDefault();
        if (highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        } else if (showAddNew) {
          handleSelectAddNew();
        }
      } else if (isOpen && showAddNew && filteredOptions.length === 0) {
        e.preventDefault();
        handleSelectAddNew();
      } else if (onEnter) {
        e.preventDefault();
        setIsOpen(false);
        onEnter();
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          className="cbm-form-input"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: 40,
            paddingRight: 32,
            backgroundColor: 'var(--bg-surface)',
            borderColor: isOpen ? 'var(--border-focus)' : 'var(--border)',
            boxShadow: isOpen ? '0 0 0 1px var(--gold)' : 'none'
          }}
          autoComplete="off"
        />
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen(prev => !prev);
              inputRef.current?.focus();
            }
          }}
          style={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: disabled ? 'default' : 'pointer',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            padding: 2
          }}
          tabIndex={-1}
          title="Toggle dropdown"
        >
          <ChevronRight
            size={14}
            style={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease'
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
            zIndex: 100,
            maxHeight: 220,
            overflowY: 'auto',
            padding: '4px 0'
          }}
        >
          {filteredOptions.map((opt, index) => {
            const isHighlighted = highlightedIndex === index;
            return (
              <div
                key={opt.name}
                onClick={() => handleSelectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? 'var(--gold-subtle)' : 'transparent',
                  color: isHighlighted ? 'var(--gold-text)' : 'var(--text-heading)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  borderBottom: index < filteredOptions.length - 1 || showAddNew ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background-color 0.1s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {opt.name}
                  </span>
                  {opt.subcategories && opt.subcategories.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', backgroundColor: 'var(--bg-page)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--border)' }}>
                      {opt.subcategories.length} subcat{opt.subcategories.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {opt.description && (
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {opt.description}
                  </span>
                )}
              </div>
            );
          })}

          {showAddNew && (
            <div
              onClick={handleSelectAddNew}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              style={{
                padding: '9px 12px',
                cursor: 'pointer',
                backgroundColor: highlightedIndex === filteredOptions.length ? 'var(--gold-subtle)' : 'var(--bg-page)',
                color: 'var(--gold-text)',
                fontWeight: 700,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderTop: filteredOptions.length > 0 ? '1px solid var(--border)' : 'none'
              }}
            >
              <Plus size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>
                {addNewPrefix} <span style={{ textDecoration: 'underline' }}>"{value.trim()}"</span> {addNewSuffix}
              </span>
            </div>
          )}

          {filteredOptions.length === 0 && !showAddNew && (
            <div style={{ padding: '12px 14px', fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AcademicYearsPage = () => {
  const {
    academicYears,
    createFullAcademicYear,
    updateAcademicYear,
    updateAcademicYearStatus,
    deleteAcademicYear,
    refreshAcademicYears,
    loading
  } = useBudget();

  // Existing categories and subcategories loaded from database
  const [categoryOptions, setCategoryOptions] = useState([]);
  const isFetchingOptionsRef = useRef(false);

  const loadCategoryOptions = useCallback(async () => {
    if (isFetchingOptionsRef.current) return;
    isFetchingOptionsRef.current = true;

    try {
      const res = await api.get('/api/academic-years/category-options');
      if (res?.success && Array.isArray(res.categoryOptions)) {
        setCategoryOptions(res.categoryOptions);
        return;
      }
    } catch (err) {
      const errorMsg = err?.message || 'Failed to load category options from server.';
      console.warn('Category options fetch notice:', errorMsg);
    } finally {
      isFetchingOptionsRef.current = false;
    }
  }, []);

  // Supplement options from loaded academic years if database options array is empty
  useEffect(() => {
    if (categoryOptions.length === 0 && academicYears && academicYears.length > 0) {
      const catMap = new Map();
      academicYears.forEach(ay => {
        (ay.categories || []).forEach(cat => {
          const name = (cat.name || '').trim();
          if (!name) return;
          const key = name.toLowerCase();
          if (!catMap.has(key)) {
            catMap.set(key, {
              name,
              description: cat.description || '',
              subcategories: new Set()
            });
          }
          const entry = catMap.get(key);
          if (cat.description && !entry.description) {
            entry.description = cat.description;
          }
          (cat.subcategories || []).map(s => (typeof s === 'string' ? s : s.name)).forEach(sub => {
            if (sub) entry.subcategories.add(sub.trim());
          });
        });
      });
      if (catMap.size > 0) {
        setCategoryOptions(
          Array.from(catMap.values()).map(e => ({
            name: e.name,
            description: e.description,
            subcategories: Array.from(e.subcategories)
          }))
        );
      }
    }
  }, [academicYears, categoryOptions.length]);

  // Load fresh academic years and category templates from database/API on mount
  useEffect(() => {
    refreshAcademicYears();
    loadCategoryOptions();
  }, [refreshAcademicYears, loadCategoryOptions]);

  // View state: 'list' (Register) or 'wizard' (Multi-Step Form)
  const [viewMode, setViewMode] = useState('list');
  const [activeStep, setActiveStep] = useState(1);

  // Search & Status Filter for Register
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Preview Modal for existing academic years from register
  const [viewingYear, setViewingYear] = useState(null);

  // Edit Academic Year via full wizard
  const [editingYearId, setEditingYearId] = useState(null);

  // Edit Modal State
  const [editingYear, setEditingYear] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'DRAFT',
    annualBudget: 0
  });
  const [isUpdatingYear, setIsUpdatingYear] = useState(false);

  // Helper date formatter
  const formatDateDisplay = (dateStr, fallbackYear) => {
    if (!dateStr && !fallbackYear) return '—';
    try {
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
      return `${fallbackYear}`;
    } catch {
      return dateStr || `${fallbackYear}`;
    }
  };

  // ---------------------------------------------------------------------------
  // MULTI-STEP WIZARD STATE
  // ---------------------------------------------------------------------------
  // Step 1: Academic Year (Single consecutive start year selector)
  const [startYear, setStartYear] = useState(CURRENT_YEAR);
  const [yearStatus, setYearStatus] = useState('DRAFT'); // 'DRAFT', 'ACTIVE', 'CLOSED'
  const [step1Error, setStep1Error] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState('');
  const checkReqSeqRef = useRef(0);

  // End year is strictly startYear + 1
  const endYear = useMemo(() => parseInt(startYear) + 1, [startYear]);
  const displayYearName = `${startYear} - ${endYear}`;
  const dbYearFormat = `${startYear}-${endYear}`;

  // Immediate duplicate check function using request sequence ID to eliminate race conditions
  const checkDuplicateYear = useCallback(async (yearVal) => {
    const s = parseInt(yearVal, 10);
    if (isNaN(s) || s < 2000 || s > 2100) {
      setDuplicateError('');
      setIsCheckingDuplicate(false);
      return;
    }

    const targetCanonical = `${s}-${s + 1}`;
    const currentSeq = ++checkReqSeqRef.current;

    // Immediately clear previous error and indicate validation is in-flight
    setDuplicateError('');
    setIsCheckingDuplicate(true);

    // Fast synchronous check against loaded academicYears list
    const localMatch = (academicYears || []).some(ay => {
      if (editingYearId && ay.id === editingYearId) return false;
      const ayCanon = canonicalAcademicYear(ay.academicYear || ay.academic_year || ay.name);
      return ayCanon === targetCanonical;
    });

    if (localMatch) {
      if (checkReqSeqRef.current === currentSeq) {
        setDuplicateError('Academic year already exists.');
        setIsCheckingDuplicate(false);
      }
      return;
    }

    if (editingYearId) {
      if (checkReqSeqRef.current === currentSeq) {
        setDuplicateError('');
        setIsCheckingDuplicate(false);
      }
      return;
    }

    try {
      const res = await api.get(`/api/academic-years/check-duplicate?year=${encodeURIComponent(targetCanonical)}`);
      if (checkReqSeqRef.current !== currentSeq) return; // Ignore stale response

      if (res?.isDuplicate) {
        setDuplicateError('Academic year already exists.');
      } else {
        setDuplicateError('');
      }
    } catch (err) {
      if (checkReqSeqRef.current !== currentSeq) return;
      console.warn('Duplicate check API notice:', err.message);
      if (localMatch) {
        setDuplicateError('Academic year already exists.');
      } else {
        setDuplicateError('');
      }
    } finally {
      if (checkReqSeqRef.current === currentSeq) {
        setIsCheckingDuplicate(false);
      }
    }
  }, [academicYears, editingYearId]);

  // Synchronize validation whenever active wizard step or startYear changes
  useEffect(() => {
    if (viewMode === 'wizard' && activeStep === 1) {
      checkDuplicateYear(startYear);
    }
  }, [viewMode, activeStep, startYear, checkDuplicateYear]);

  // Step 2: Categories List (Category Name + Category Budget)
  const [categories, setCategories] = useState([]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [step2Error, setStep2Error] = useState('');

  // Step 3: Subcategories State
  const [step3Error, setStep3Error] = useState('');
  const [newSubcatInputs, setNewSubcatInputs] = useState({});

  // Submitting state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // Calculations: Academic Year Total = SUM of all Category Budgets
  // ---------------------------------------------------------------------------
  const calculatedAnnualBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (Number(cat.budget) || 0), 0);
  }, [categories]);

  // Open wizard to create brand new academic year
  const handleOpenNewWizard = () => {
    loadCategoryOptions();
    setEditingYearId(null);
    setStartYear(CURRENT_YEAR);
    setYearStatus('DRAFT');
    setStep1Error('');
    setDuplicateError('');
    setIsCheckingDuplicate(false);
    setStep2Error('');
    setStep3Error('');
    setNewCatName('');
    setNewCatBudget('');
    setNewCatDesc('');
    setNewSubcatInputs({});
    setSaveSuccess(false);
    setCategories([]);
    setActiveStep(1);
    setViewMode('wizard');
    checkDuplicateYear(CURRENT_YEAR);
  };

  // Open wizard to edit full configuration of an existing academic year
  const handleOpenEditWizard = async (ay) => {
    loadCategoryOptions();
    setEditingYearId(ay.id);
    const match = String(ay.academicYear || ay.name || '').match(/(\d{4})/);
    const sYear = match ? parseInt(match[1], 10) : (ay.startYear || CURRENT_YEAR);
    setStartYear(sYear);
    setYearStatus(ay.status || (ay.isActive ? 'ACTIVE' : 'DRAFT'));
    setStep1Error('');
    setDuplicateError('');
    setIsCheckingDuplicate(false);
    setStep2Error('');
    setStep3Error('');
    setNewCatName('');
    setNewCatBudget('');
    setNewCatDesc('');
    setNewSubcatInputs({});
    setSaveSuccess(false);

    // Fetch fresh academic year details to ensure full categories & subcategories from DB
    let fullAy = ay;
    try {
      const res = await api.get(`/api/academic-years/${ay.id}`);
      if (res?.success && res.academicYear) {
        fullAy = res.academicYear;
      }
    } catch (e) {
      console.warn('Note fetching full academic year details:', e.message);
    }

    const existingCats = (fullAy.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description || '',
      budget: Number(c.budget !== undefined ? c.budget : (c.allocated_amount || 0)),
      subcategories: (c.subcategories || []).map((s) => ({
        id: s.id,
        name: typeof s === 'string' ? s : s.name
      }))
    }));
    setCategories(existingCats);
    setActiveStep(1);
    setViewMode('wizard');
    setViewingYear(null);
    setEditingYear(null);
  };

  // ---------------------------------------------------------------------------
  // STEP NAVIGATION & VALIDATIONS
  // ---------------------------------------------------------------------------
  const validateStep1 = () => {
    setStep1Error('');
    const s = parseInt(startYear);

    if (isNaN(s) || s < 2000 || s > 2100) {
      setStep1Error('Please select a valid Starting Year.');
      return false;
    }

    if (isCheckingDuplicate) {
      setStep1Error('Validating academic year availability. Please wait...');
      return false;
    }

    if (duplicateError) {
      setStep1Error(duplicateError);
      return false;
    }

    // Check duplicate academic year
    const targetCanonical = `${s}-${s + 1}`;
    const isDuplicate = (academicYears || []).some(ay => {
      if (editingYearId && ay.id === editingYearId) return false;
      const ayCanon = canonicalAcademicYear(ay.academicYear || ay.academic_year || ay.name);
      return ayCanon === targetCanonical;
    });

    if (isDuplicate) {
      setDuplicateError('Academic year already exists.');
      setStep1Error('Academic year already exists.');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    setStep2Error('');
    if (categories.length === 0) {
      setStep2Error('Please add at least one departmental category.');
      return false;
    }

    for (const cat of categories) {
      if (!cat.name || !cat.name.trim()) {
        setStep2Error('All categories must have a valid name.');
        return false;
      }
      const b = Number(cat.budget);
      if (isNaN(b) || b <= 0) {
        setStep2Error(`Category "${cat.name}" requires a valid budget amount greater than ₹0.`);
        return false;
      }
    }

    return true;
  };

  const validateStep3 = () => {
    setStep3Error('');
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!validateStep1()) return;
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!validateStep2()) return;
      // Automatically associate existing subcategories from DB for any category with empty subcategories
      setCategories(prev => prev.map(cat => {
        if (cat.subcategories && cat.subcategories.length > 0) return cat;
        const matchingTemplate = categoryOptions.find(
          opt => (opt.name || '').trim().toLowerCase() === (cat.name || '').trim().toLowerCase()
        );
        if (matchingTemplate && Array.isArray(matchingTemplate.subcategories) && matchingTemplate.subcategories.length > 0) {
          return {
            ...cat,
            subcategories: matchingTemplate.subcategories.map((s, idx) => ({
              id: `sub-auto-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
              name: typeof s === 'string' ? s : (s.name || s)
            }))
          };
        }
        return cat;
      }));
      setActiveStep(3);
    } else if (activeStep === 3) {
      if (!validateStep3()) return;
      setActiveStep(4);
    } else if (activeStep === 4) {
      setActiveStep(5);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // ---------------------------------------------------------------------------
  // CATEGORY ACTIONS (Step 2)
  // ---------------------------------------------------------------------------
  const handleAddCategory = () => {
    setStep2Error('');
    const cleanName = newCatName.trim();
    if (!cleanName) {
      setStep2Error('Please enter a Category Name.');
      return;
    }

    const budgetVal = Number(newCatBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setStep2Error('Please enter a valid Category Budget (₹) greater than 0.');
      return;
    }

    if (categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      setStep2Error(`Category "${cleanName}" already exists in this Academic Year.`);
      return;
    }

    // Automatically look up associated existing subcategories from database templates
    const matchingTemplate = categoryOptions.find(
      opt => (opt.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    const autoSubs = (matchingTemplate?.subcategories || []).map((s, idx) => ({
      id: `sub-init-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: typeof s === 'string' ? s : (s.name || s)
    }));

    const newCat = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      description: (matchingTemplate?.description || '').trim(),
      budget: budgetVal,
      subcategories: autoSubs
    };

    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setNewCatBudget('');
    setNewCatDesc('');
  };

  const handleRemoveCategory = (catId) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const handleCategoryBudgetChange = (catId, newAmount) => {
    const val = Number(newAmount) || 0;
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, budget: val } : c));
  };

  // ---------------------------------------------------------------------------
  // SUBCATEGORY ACTIONS (Step 3: Classification only, NO budget)
  // ---------------------------------------------------------------------------
  const handleAddSubcategory = (catId, explicitName) => {
    setStep3Error('');
    const rawName = explicitName !== undefined ? explicitName : (newSubcatInputs[catId] || '');
    const subName = (typeof rawName === 'string' ? rawName : rawName?.name || '').trim();
    if (!subName) {
      setStep3Error('Please enter a subcategory name before adding.');
      return;
    }

    const targetCat = categories.find(c => c.id === catId);
    if (!targetCat) return;

    const existingSubs = targetCat.subcategories || [];
    if (existingSubs.some(s => (typeof s === 'string' ? s : s.name).trim().toLowerCase() === subName.toLowerCase())) {
      setStep3Error(`Subcategory "${subName}" already exists under "${targetCat.name}". Duplicates are not allowed.`);
      return;
    }

    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: subName
    };

    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: [...existingSubs, newSub]
      };
    }));

    setNewSubcatInputs(prev => ({ ...prev, [catId]: '' }));
    setStep3Error('');
  };

  const handleRemoveSubcategory = (catId, subIdentifier) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        subcategories: (cat.subcategories || []).filter(s => {
          const sName = typeof s === 'string' ? s : s.name;
          return s.id !== subIdentifier && sName !== subIdentifier;
        })
      };
    }));
    setStep3Error('');
  };

  // ---------------------------------------------------------------------------
  // FINAL SUBMISSION (Step 5)
  // ---------------------------------------------------------------------------
  const handleFinalSubmit = async () => {
    if (duplicateError || isCheckingDuplicate) {
      setStep1Error('Academic year already exists.');
      setActiveStep(1);
      return;
    }

    setIsSaving(true);
    setStep1Error('');

    const payload = {
      startYear: parseInt(startYear),
      endYear,
      name: displayYearName,
      academicYear: dbYearFormat,
      status: yearStatus,
      isActive: yearStatus === 'ACTIVE',
      budget: calculatedAnnualBudget,
      annualBudget: calculatedAnnualBudget,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        budget: Number(cat.budget || 0),
        subcategories: (cat.subcategories || []).map(s => ({
          id: s.id,
          name: typeof s === 'string' ? s : s.name
        }))
      }))
    };

    let result;
    if (editingYearId) {
      result = await updateAcademicYear(editingYearId, payload);
    } else {
      result = await createFullAcademicYear(payload);
    }
    setIsSaving(false);

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setViewMode('list');
        setSaveSuccess(false);
        setEditingYearId(null);
      }, 1500);
    } else {
      if (result.error && result.error.toLowerCase().includes('already exists')) {
        setDuplicateError('Academic year already exists.');
        setStep1Error('Academic year already exists.');
        setActiveStep(1);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // FILTERED ACADEMIC YEARS (Register Table)
  // ---------------------------------------------------------------------------
  const filteredYears = useMemo(() => {
    return academicYears.filter(ay => {
      const matchesSearch =
        (ay.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ay.academicYear || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === 'All') return matchesSearch;
      if (statusFilter === 'Active') return matchesSearch && (ay.status === 'ACTIVE' || ay.isActive);
      if (statusFilter === 'Draft') return matchesSearch && ay.status === 'DRAFT' && !ay.isActive;
      if (statusFilter === 'Closed') return matchesSearch && ay.status === 'CLOSED';
      return matchesSearch;
    });
  }, [academicYears, searchTerm, statusFilter]);

  return (
    <DashboardLayout pageTitle="Academic Years">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* ===================================================================== */}
        {/* TOP HEADER AREA */}
        {/* ===================================================================== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <CalendarRange size={15} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', letterSpacing: '0.04em' }}>
                ADMINISTRATIVE SETUP & LEDGER
              </span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Academic Year Management
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, marginBottom: 0, maxWidth: 850 }}>
              Configure consecutive academic year cycles, assign departmental category budgets, and establish subcategory groupings for faculty proposals.
            </p>
          </div>

          {viewMode === 'list' && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenNewWizard}
            >
              Configure Academic Year
            </Button>
          )}

          {viewMode === 'wizard' && (
            <Button
              variant="outline"
              size="sm"
              icon={X}
              onClick={() => setViewMode('list')}
            >
              Close Wizard
            </Button>
          )}
        </div>

        {/* ===================================================================== */}
        {/* WIZARD MODE (Multi-Step Creation Flow) */}
        {/* ===================================================================== */}
        {viewMode === 'wizard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Step Indicator Strip */}
            <div className="cbm-card" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', overflowX: 'auto', gap: 12 }}>
                {STEPS.map((step, idx) => {
                  const isCompleted = activeStep > step.id;
                  const isCurrent = activeStep === step.id;
                  return (
                    <React.Fragment key={step.id}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          opacity: isCurrent || isCompleted ? 1 : 0.45,
                          cursor: isCompleted ? 'pointer' : 'default',
                          flexShrink: 0
                        }}
                        onClick={() => isCompleted && setActiveStep(step.id)}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor: isCurrent
                              ? 'var(--primary)'
                              : isCompleted
                              ? 'var(--gold)'
                              : 'var(--border)',
                            color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-muted)'
                          }}
                        >
                          {isCompleted ? <Check size={14} /> : step.id}
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'var(--text-heading)' : 'var(--text-body)' }}>
                            {step.label}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {step.description}
                          </div>
                        </div>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            minWidth: 20,
                            height: 2,
                            backgroundColor: activeStep > step.id ? 'var(--gold)' : 'var(--border)',
                            margin: '0 4px'
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: ACADEMIC YEAR (Consecutive Start Year + Auto-calculated End Year) */}
            {activeStep === 1 && (
              <section className="cbm-section">
                <div className="cbm-section-header">
                  <div>
                    <h2 className="cbm-section-title">
                      {editingYearId ? `Edit Academic Year: ${displayYearName}` : 'Step 1: Select Academic Year Period'}
                    </h2>
                    <p className="cbm-section-subtitle">
                      {editingYearId
                        ? `Modify category budgets, add/remove subcategories, and adjust lifecycle status for ${displayYearName}.`
                        : 'Choose the starting year. The consecutive ending year and academic year designation will be generated automatically.'}
                    </p>
                  </div>
                </div>

                <div className="cbm-card" style={{ maxWidth: 720, padding: '24px 28px' }}>
                  {step1Error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 6, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, marginBottom: 18 }}>
                      <AlertCircle size={16} />
                      <span>{step1Error}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                        Start Year <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <select
                        className="cbm-form-select"
                        value={startYear}
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value, 10);
                          setStartYear(newYear);
                          setStep1Error('');
                          checkDuplicateYear(newYear);
                        }}
                        style={{
                          width: '100%',
                          height: 42,
                          borderColor: duplicateError ? '#dc2626' : undefined,
                          boxShadow: duplicateError ? '0 0 0 1px #dc2626' : undefined
                        }}
                        aria-invalid={!!duplicateError}
                      >
                        {YEAR_OPTIONS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>

                      {isCheckingDuplicate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          <span>Checking availability...</span>
                        </div>
                      ) : duplicateError ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12.5, color: '#dc2626', fontWeight: 600 }}>
                          <AlertCircle size={14} />
                          <span>Academic year already exists.</span>
                        </div>
                      ) : (
                        <span className="cbm-form-help" style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                          Starting year of the session
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                        Consecutive End Year <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Calculated)</span>
                      </label>
                      <input
                        type="text"
                        className="cbm-form-input"
                        value={endYear}
                        disabled
                        style={{ backgroundColor: 'var(--bg-page)', cursor: 'not-allowed', fontWeight: 600, width: '100%', height: 42 }}
                      />
                      <span className="cbm-form-help" style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Automatically set to Start Year + 1
                      </span>
                    </div>
                  </div>

                  {/* Generated Academic Year Display Card */}
                  <div
                    style={{
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--gold-border)',
                      marginBottom: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Generated Academic Year Name
                      </span>
                      <Badge status={yearStatus} />
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginTop: 2 }}>
                      {displayYearName}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>Database Identifier:</span>
                      <code style={{ fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
                        {dbYearFormat}
                      </code>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>• Strict Consecutive Cycle (Start Year + 1)</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                      Initial Lifecycle Status <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select
                      className="cbm-form-select"
                      value={yearStatus}
                      onChange={(e) => setYearStatus(e.target.value)}
                      style={{ width: '100%', height: 42 }}
                    >
                      <option value="DRAFT">DRAFT (Configuration mode, faculty cannot submit)</option>
                      <option value="ACTIVE">ACTIVE (Open for faculty budget proposals)</option>
                      <option value="CLOSED">CLOSED (Historical / Archive)</option>
                    </select>
                    <span className="cbm-form-help" style={{ display: 'block', marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                      Note: Only one academic year can be ACTIVE. Activating this year will automatically close any other active academic years.
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <Button
                      variant="primary"
                      icon={ChevronRight}
                      onClick={handleNextStep}
                      disabled={isCheckingDuplicate || Boolean(duplicateError)}
                    >
                      {isCheckingDuplicate ? 'Checking...' : 'Next: Add Categories'}
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: CREATE CATEGORIES (Category Name + Direct Category Budget) */}
            {activeStep === 2 && (
              <section className="cbm-section">
                <div className="cbm-section-header">
                  <div>
                    <h2 className="cbm-section-title">Step 2: Create Department Categories & Budgets</h2>
                    <p className="cbm-section-subtitle">
                      Define departmental activity categories and allocate their direct budget quotas for {displayYearName}.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Total Category Quota</span>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold-text)' }}>
                      ₹{calculatedAnnualBudget.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {step2Error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 6, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
                    <AlertCircle size={16} />
                    <span>{step2Error}</span>
                  </div>
                )}

                {/* Add Category Form */}
                <div className="cbm-card" style={{ marginBottom: 20, backgroundColor: 'var(--bg-page)', border: '1px dashed var(--gold-border)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 12 }}>
                    + Add New or Select Existing Category
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label className="cbm-form-label">
                        Category Name <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <Combobox
                        placeholder="Select existing or type new category..."
                        value={newCatName}
                        onChange={(val) => {
                          setNewCatName(val);
                          setStep2Error('');
                        }}
                        onSelect={(item) => {
                          if (typeof item === 'object' && item !== null) {
                            setNewCatName(item.name);
                            if (item.description && !newCatDesc) {
                              setNewCatDesc(item.description);
                            }
                          } else {
                            setNewCatName(item);
                          }
                          setStep2Error('');
                        }}
                        options={categoryOptions}
                        excludeValues={categories.map(c => c.name)}
                        addNewPrefix="Add"
                        addNewSuffix="as new category"
                        emptyMessage="No existing categories in database. Type a name to create a new category."
                      />
                    </div>
                    <div>
                      <label className="cbm-form-label">
                        Category Budget (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 500000"
                        value={newCatBudget}
                        onChange={(e) => setNewCatBudget(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <Button variant="secondary" icon={Plus} onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </div>

                {/* Categories Table */}
                <div className="cbm-table-container" style={{ marginBottom: 20 }}>
                  <table className="cbm-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Category Name</th>
                        <th style={{ textAlign: 'right', width: 180 }}>Category Budget (₹)</th>
                        <th style={{ textAlign: 'center', width: 90 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No categories added yet. Please add at least one category above.
                          </td>
                        </tr>
                      ) : (
                        categories.map((cat, idx) => (
                          <tr key={cat.id}>
                            <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{cat.name}</div>
                              {cat.description && (
                                <div style={{ color: 'var(--text-muted)', fontSize: 11.5, marginTop: 2 }}>
                                  {cat.description}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <input
                                type="number"
                                value={cat.budget}
                                onChange={(e) => handleCategoryBudgetChange(cat.id, e.target.value)}
                                style={{
                                  width: 130,
                                  textAlign: 'right',
                                  padding: '4px 8px',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleRemoveCategory(cat.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--danger)',
                                  cursor: 'pointer',
                                  padding: 4
                                }}
                                title="Remove Category"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: 'var(--bg-page)', fontWeight: 700 }}>
                        <td colSpan={2} style={{ textAlign: 'right' }}>ANNUAL TOTAL (SUM OF ALL CATEGORIES):</td>
                        <td style={{ textAlign: 'right', fontSize: 15, color: 'var(--gold-text)' }}>
                          ₹{calculatedAnnualBudget.toLocaleString('en-IN')}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="outline" icon={ChevronLeft} onClick={handlePrevStep}>
                    Back: Period
                  </Button>
                  <Button variant="primary" icon={ChevronRight} onClick={handleNextStep}>
                    Next: Add Subcategories
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 3: ADD SUBCATEGORIES (Classification only, NO separate budgets) */}
            {activeStep === 3 && (
              <section className="cbm-section">
                <div className="cbm-section-header">
                  <div>
                    <h2 className="cbm-section-title">Step 3: Add Subcategories (Classification Groupings)</h2>
                    <p className="cbm-section-subtitle">
                      Add subcategories under each category for faculty proposal classifications. Subcategories share their parent category budget with no separate budget field.
                    </p>
                  </div>
                </div>

                {step3Error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 6, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, marginBottom: 16 }}>
                    <AlertCircle size={16} />
                    <span>{step3Error}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                  {categories.map((cat) => (
                    <div key={cat.id} className="cbm-card" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Layers size={16} style={{ color: 'var(--gold)' }} />
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>
                            {cat.name}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-text)' }}>
                          Category Budget: ₹{Number(cat.budget).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Existing Subcategories List */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                        {(!cat.subcategories || cat.subcategories.length === 0) ? (
                          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', border: '1px dashed var(--border)', width: '100%' }}>
                            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              No subcategories currently associated with {cat.name}. Select an existing subcategory or type a new one below to add.
                            </span>
                          </div>
                        ) : (
                          cat.subcategories.map(sub => {
                            const subName = typeof sub === 'string' ? sub : sub.name;
                            const subKey = sub.id || subName;
                            return (
                              <div
                                key={subKey}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-page)',
                                  border: '1px solid var(--border)',
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: 'var(--text-heading)'
                                }}
                              >
                                <span>{subName}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubcategory(cat.id, subKey)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title={`Remove ${subName} from ${cat.name}`}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Add Subcategory Combobox Input */}
                      <div style={{ display: 'flex', gap: 8, maxWidth: 520, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <Combobox
                            placeholder={`Select existing or type subcategory for ${cat.name}...`}
                            value={newSubcatInputs[cat.id] || ''}
                            onChange={(val) => {
                              setNewSubcatInputs(prev => ({ ...prev, [cat.id]: val }));
                              setStep3Error('');
                            }}
                            onSelect={(item) => {
                              const subName = typeof item === 'object' && item !== null ? item.name : item;
                              if (subName) {
                                handleAddSubcategory(cat.id, subName);
                              }
                            }}
                            options={(() => {
                              const catTemplate = categoryOptions.find(
                                opt => (opt.name || '').trim().toLowerCase() === (cat.name || '').trim().toLowerCase()
                              );
                              return catTemplate?.subcategories || [];
                            })()}
                            excludeValues={(cat.subcategories || []).map(s => typeof s === 'string' ? s : s.name)}
                            addNewPrefix="Add"
                            addNewSuffix={`to ${cat.name}`}
                            emptyMessage={`No more existing subcategories for ${cat.name}. Type a new name to add.`}
                            onEnter={() => handleAddSubcategory(cat.id)}
                          />
                        </div>
                        <Button
                          variant="secondary"
                          icon={FolderPlus}
                          onClick={() => handleAddSubcategory(cat.id)}
                          style={{ height: 40, flexShrink: 0 }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="outline" icon={ChevronLeft} onClick={handlePrevStep}>
                    Back: Categories
                  </Button>
                  <Button variant="primary" icon={ChevronRight} onClick={handleNextStep}>
                    Next: Review
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 4: REVIEW */}
            {activeStep === 4 && (
              <section className="cbm-section">
                <div className="cbm-section-header">
                  <div>
                    <h2 className="cbm-section-title">Step 4: Review Academic Year Configuration</h2>
                    <p className="cbm-section-subtitle">
                      Verify the academic year period, category budgets, subcategory classifications, and calculated annual total before saving.
                    </p>
                  </div>
                </div>

                <div className="cbm-card" style={{ marginBottom: 20 }}>
                  {/* Top Metric Strip */}
                  <div className="cbm-metric-strip" style={{ marginBottom: 20 }}>
                    <div className="cbm-metric-item cbm-metric-item-highlight">
                      <span className="cbm-metric-label">Academic Year</span>
                      <div className="cbm-metric-value" style={{ fontSize: 20 }}>{displayYearName}</div>
                      <span className="cbm-metric-supporting">DB: {dbYearFormat}</span>
                    </div>

                    <div className="cbm-metric-item">
                      <span className="cbm-metric-label">Initial Status</span>
                      <div style={{ marginTop: 6 }}>
                        <Badge status={yearStatus} />
                      </div>
                      <span className="cbm-metric-supporting">Lifecycle state</span>
                    </div>

                    <div className="cbm-metric-item">
                      <span className="cbm-metric-label">Categories Count</span>
                      <div className="cbm-metric-value" style={{ fontSize: 20 }}>{categories.length} Categories</div>
                      <span className="cbm-metric-supporting">
                        {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} Subcategories
                      </span>
                    </div>

                    <div className="cbm-metric-item cbm-metric-item-highlight">
                      <span className="cbm-metric-label">Calculated Annual Budget</span>
                      <div className="cbm-metric-value" style={{ fontSize: 22, color: 'var(--gold-text)' }}>
                        ₹{calculatedAnnualBudget.toLocaleString('en-IN')}
                      </div>
                      <span className="cbm-metric-supporting">Sum of all category budgets</span>
                    </div>
                  </div>

                  {/* Categories Breakdown Table */}
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 12 }}>
                    Department Category Allocations
                  </h3>
                  <div className="cbm-table-container">
                    <table className="cbm-table">
                      <thead>
                        <tr>
                          <th>Category Name</th>
                          <th>Subcategories</th>
                          <th style={{ textAlign: 'right' }}>Category Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                              {cat.name}
                              {cat.description && (
                                <div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {cat.description}
                                </div>
                              )}
                            </td>
                            <td>
                              {(!cat.subcategories || cat.subcategories.length === 0) ? (
                                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>None (Direct Category)</span>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {cat.subcategories.map(s => (
                                    <span
                                      key={s.id}
                                      style={{
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        backgroundColor: 'var(--bg-page)',
                                        border: '1px solid var(--border)',
                                        fontSize: 11.5,
                                        fontWeight: 600,
                                        color: 'var(--text-body)'
                                      }}
                                    >
                                      {s.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-heading)' }}>
                              ₹{Number(cat.budget).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: 'var(--bg-page)', fontWeight: 800 }}>
                          <td colSpan={2} style={{ textAlign: 'right' }}>ANNUAL TOTAL:</td>
                          <td style={{ textAlign: 'right', fontSize: 16, color: 'var(--gold-text)' }}>
                            ₹{calculatedAnnualBudget.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="outline" icon={ChevronLeft} onClick={handlePrevStep}>
                    Back: Subcategories
                  </Button>
                  <Button variant="primary" icon={ChevronRight} onClick={handleNextStep}>
                    Next: Final Confirmation
                  </Button>
                </div>
              </section>
            )}

            {/* STEP 5: SAVE & CREATE */}
            {activeStep === 5 && (
              <section className="cbm-section">
                <div className="cbm-card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '32px 24px' }}>
                  {saveSuccess ? (
                    <div>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle2 size={28} />
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
                        Academic Year Created Successfully!
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {displayYearName} ({dbYearFormat}) is now saved in the system ledger.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--gold-subtle)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Coins size={28} />
                      </div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
                        Confirm & Save Academic Year
                      </h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                        You are about to create <strong>{displayYearName}</strong> with <strong>{categories.length} categories</strong> and a total annual budget of <strong>₹{calculatedAnnualBudget.toLocaleString('en-IN')}</strong>.
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <Button variant="outline" onClick={handlePrevStep} disabled={isSaving}>
                          Back to Review
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleFinalSubmit}
                          disabled={isSaving || isCheckingDuplicate || Boolean(duplicateError)}
                        >
                          {isSaving ? 'Saving Configuration...' : 'Confirm & Save Academic Year'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* LIST VIEW: ACADEMIC YEARS REGISTER */}
        {/* ===================================================================== */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="cbm-form-input"
                    placeholder="Search academic year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ height: 34, paddingLeft: 30, fontSize: 12.5 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  {['All', 'Active', 'Draft', 'Closed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className="cbm-btn cbm-btn-sm"
                      style={{
                        backgroundColor: statusFilter === tab ? 'var(--primary)' : 'var(--bg-surface)',
                        color: statusFilter === tab ? '#ffffff' : 'var(--text-body)',
                        border: '1px solid var(--border)',
                        fontWeight: 600,
                        height: 30,
                        padding: '0 8px',
                        fontSize: 11.5
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                {filteredYears.length} Academic Year(s) Recorded
              </span>
            </div>

            {/* Academic Years Table */}
            <div className="cbm-table-container">
              <table className="cbm-table">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Categories Count</th>
                    <th style={{ textAlign: 'right' }}>Total Annual Budget</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton rows={4} cols={7} />
                  ) : filteredYears.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '16px 14px', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No Academic Years Found</p>
                        <p style={{ fontSize: 11.5, margin: 0 }}>Click &quot;Configure Academic Year&quot; above to create a new session.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredYears.map((ay) => {
                      const isActive = ay.status === 'ACTIVE' || ay.isActive;
                      const formattedName = ay.name || ay.academicYear || `${ay.startYear} - ${ay.endYear}`;
                      const budgetNum = Number(ay.annualBudget || ay.budget || 0);
                      const catCount = ay.categoriesCount !== undefined ? ay.categoriesCount : (ay.categories?.length || 0);
                      const startDateStr = formatDateDisplay(ay.startDate, ay.startYear ? `01/06/${ay.startYear}` : '');
                      const endDateStr = formatDateDisplay(ay.endDate, ay.endYear ? `31/05/${ay.endYear}` : '');

                      return (
                        <tr key={ay.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <CalendarRange size={16} style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }} />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 13.5 }}>
                                  {formattedName}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  ID: {ay.academicYear || formattedName.replace(/\s+/g, '')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5, color: 'var(--text-body)', fontWeight: 500 }}>
                            {startDateStr}
                          </td>
                          <td style={{ fontSize: 12.5, color: 'var(--text-body)', fontWeight: 500 }}>
                            {endDateStr}
                          </td>
                          <td>
                            <Badge status={ay.status || (isActive ? 'ACTIVE' : 'DRAFT')} />
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--text-body)' }}>
                            {catCount} Categories
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-heading)' }}>
                            ₹{budgetNum.toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              {/* View Details */}
                              <button
                                onClick={async () => {
                                  setViewingYear(ay);
                                  try {
                                    const res = await api.get(`/api/academic-years/${ay.id}`);
                                    if (res?.success && res.academicYear) {
                                      setViewingYear(res.academicYear);
                                    }
                                  } catch (e) {
                                    console.warn('Note fetching fresh view details:', e.message);
                                  }
                                }}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-body)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title="View Academic Year Details"
                              >
                                <Eye size={12} />
                                <span>View</span>
                              </button>

                              {/* Edit Configuration */}
                              <button
                                onClick={() => handleOpenEditWizard(ay)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-body)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                title="Edit Academic Year & Category Allocations"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>

                              {/* Activate / Close Status */}
                              {!isActive && (
                                <button
                                  onClick={() => updateAcademicYearStatus(ay.id, 'ACTIVE')}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--primary)',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Activate
                                </button>
                              )}

                              {isActive && (
                                <button
                                  onClick={() => updateAcademicYearStatus(ay.id, 'CLOSED')}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--slate-200)',
                                    border: 'none',
                                    color: 'var(--slate-800)',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Close
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete Academic Year "${formattedName}"?`)) {
                                    await deleteAcademicYear(ay.id);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: 4
                                }}
                                title="Delete Academic Year"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW DETAILS MODAL (No staff assignment UI) */}
        {/* ===================================================================== */}
        {viewingYear && (
          <div className="cbm-modal-backdrop" onClick={() => setViewingYear(null)}>
            <div
              className="cbm-modal-content"
              style={{ maxWidth: 700 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Academic Year Configuration
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                    {viewingYear.name || viewingYear.academicYear || `${viewingYear.startYear} - ${viewingYear.endYear}`}
                  </h2>
                </div>
                <Badge status={viewingYear.status || (viewingYear.isActive ? 'ACTIVE' : 'DRAFT')} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, padding: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Session Identifier</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                      {viewingYear.academicYear || viewingYear.name}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Categories</span>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-heading)', marginTop: 2 }}>
                      {viewingYear.categories?.length || viewingYear.categoriesCount || 0} Configured
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Budget</span>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold-text)', marginTop: 2 }}>
                      ₹{Number(viewingYear.annualBudget || viewingYear.budget || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
                    Configured Activity Categories & Subcategories
                  </h4>
                  {(!viewingYear.categories || viewingYear.categories.length === 0) ? (
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No detailed category breakdown available for this record.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                      {viewingYear.categories.map((cat, i) => (
                        <div key={i} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: 13 }}>
                              {cat.name}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--gold-text)', fontSize: 13 }}>
                              ₹{Number(cat.budget || cat.allocated_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {cat.subcategories && cat.subcategories.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                              {cat.subcategories.map((sub, j) => (
                                <span
                                  key={j}
                                  style={{
                                    padding: '2px 6px',
                                    borderRadius: 3,
                                    backgroundColor: 'var(--bg-page)',
                                    border: '1px solid var(--border)',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--text-body)'
                                  }}
                                >
                                  {typeof sub === 'string' ? sub : sub.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <Button variant="outline" onClick={() => setViewingYear(null)}>
                  Close
                </Button>
                <Button variant="primary" icon={Edit2} onClick={() => handleOpenEditWizard(viewingYear)}>
                  Edit Configuration
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* EDIT ACADEMIC YEAR MODAL */}
        {/* ===================================================================== */}
        {editingYear && (
          <Modal
            isOpen={!!editingYear}
            onClose={() => setEditingYear(null)}
            title={`Edit Academic Year: ${editingYear.name || editingYear.academicYear}`}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsUpdatingYear(true);
                await updateAcademicYear(editingYear.id, {
                  name: editFormData.name,
                  startDate: editFormData.startDate,
                  endDate: editFormData.endDate,
                  status: editFormData.status,
                  budget: Number(editFormData.annualBudget || 0),
                  annualBudget: Number(editFormData.annualBudget || 0)
                });
                setIsUpdatingYear(false);
                setEditingYear(null);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                  Academic Year Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="cbm-form-input"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="cbm-form-input"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    className="cbm-form-input"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                  Status <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <select
                  className="cbm-form-select"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <option value="DRAFT">DRAFT (Configuration mode)</option>
                  <option value="ACTIVE">ACTIVE (Open for faculty proposals)</option>
                  <option value="CLOSED">CLOSED (Historical / Archive)</option>
                </select>
              </div>

              <div>
                <label className="cbm-form-label" style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
                  Total Annual Budget (₹)
                </label>
                <input
                  type="number"
                  className="cbm-form-input"
                  value={editFormData.annualBudget}
                  onChange={(e) => setEditFormData({ ...editFormData, annualBudget: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <Button type="button" variant="outline" onClick={() => setEditingYear(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isUpdatingYear}>
                  {isUpdatingYear ? 'Saving Changes...' : 'Save Academic Year'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};
