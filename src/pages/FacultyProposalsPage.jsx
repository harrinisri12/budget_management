
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../components/layout/FacultyLayout';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';
import { Badge } from '../components/common/Badge';
import { TableSkeleton } from '../components/common/Skeleton';
import { Plus, Eye, Search } from 'lucide-react';

export const FacultyProposalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getFacultyMetrics, loading } = useBudget();

  const metrics = getFacultyMetrics(user?.email);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);

  const proposals = metrics?.proposals || [];

  const filteredProposals = proposals.filter((p) => {
    const term = searchTerm.toLowerCase();

    const idStr = String(
      p.proposalNumber || p.proposalId || p.id || ''
    ).toLowerCase();

    const titleStr = String(p.title || '').toLowerCase();
    const catStr = String(p.category || '').toLowerCase();
    const statusStr = String(p.status || '').toLowerCase();

    return (
      idStr.includes(term) ||
      titleStr.includes(term) ||
      catStr.includes(term) ||
      statusStr.includes(term)
    );
  });

  return (
    <FacultyLayout pageTitle="My Proposals">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-heading)',
              }}
            >
              My Budget Proposals
            </h1>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}
            >
              Track the evaluation and approval status of your CSE
              department budget requests.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/proposal/new')}
            className="cbm-btn cbm-btn-primary"
            style={{ height: 38 }}
          >
            <Plus size={16} />
            <span>New Proposal</span>
          </button>
        </div>

        <hr className="cbm-divider" />

        {/* Proposals Section */}
        <section className="cbm-section">
          <div className="cbm-section-header">
            <div>
              <h2 className="cbm-section-title">
                Submitted Proposals Register
              </h2>

              <p className="cbm-section-subtitle">
                History and live tracking of department proposals
                submitted under your faculty account
              </p>
            </div>

            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              {filteredProposals.length} Proposals Recorded
            </div>
          </div>

          {/* Search */}
          <div
            style={{
              marginBottom: 16,
              maxWidth: 320,
              width: '100%',
              position: 'relative',
            }}
          >
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)',
              }}
            />

            <input
              type="text"
              placeholder="Search proposal ID, title, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cbm-input"
              style={{
                height: 36,
                paddingLeft: 32,
                fontSize: 12.5,
              }}
            />
          </div>

          {/* Table */}
          <div className="cbm-table-container">
            <table className="cbm-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Academic Year</th>
                  <th>Proposal Date</th>
                  <th>Category</th>
                  <th>Program Title</th>
                  <th>Program Date</th>
                  <th style={{ textAlign: 'right' }}>
                    Proposed Amount
                  </th>
                  <th style={{ textAlign: 'right' }}>
                    Settlement
                  </th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <TableSkeleton rows={4} columns={10} />
                ) : filteredProposals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign: 'center',
                        padding: '36px 20px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          marginBottom: 8,
                        }}
                      >
                        No matching proposals found.
                      </p>

                      <button
                        onClick={() =>
                          navigate('/faculty/proposal/new')
                        }
                        className="cbm-btn cbm-btn-outline cbm-btn-sm"
                      >
                        Create New Proposal
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProposals.map((prop) => {
                    const isSettled =
                      String(prop.settlementStatus || '').toLowerCase() ===
                      'settled';

                    const isRejected =
                      String(prop.status || '').toLowerCase() ===
                      'rejected';

                    return (
                      <tr key={prop.dbId || prop.id}>
                        <td
                          style={{
                            fontWeight: 600,
                            color: 'var(--primary)',
                          }}
                        >
                          {prop.proposalNumber ||
                            prop.proposalId ||
                            prop.id}
                        </td>

                        <td
                          style={{
                            fontWeight: 500,
                            color: 'var(--text-body)',
                          }}
                        >
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 3,
                              backgroundColor: 'var(--slate-100)',
                              color: 'var(--slate-700)',
                              fontSize: 11.5,
                              fontWeight: 600,
                            }}
                          >
                            {prop.academicYear || '—'}
                          </span>
                        </td>

                        <td
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: 12.5,
                          }}
                        >
                          {prop.proposalDate || '—'}
                        </td>

                        <td
                          style={{
                            color: 'var(--text-body)',
                            fontWeight: 500,
                          }}
                        >
                          <div>{prop.category || '—'}</div>

                          {prop.subCategory && (
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                              }}
                            >
                              {prop.subCategory}
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            color: 'var(--text-heading)',
                            fontWeight: 600,
                          }}
                        >
                          {prop.title || '—'}
                        </td>

                        <td
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: 12.5,
                          }}
                        >
                          {prop.programDate || '—'}
                        </td>

                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 700,
                            color: 'var(--text-heading)',
                          }}
                        >
                          ₹
                          {Number(prop.amount || 0).toLocaleString(
                            'en-IN'
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          {isSettled ? (
                            <span
                              style={{
                                fontWeight: 700,
                                color: '#0369A1',
                              }}
                            >
                              ₹
                              {Number(
                                prop.settlementAmount || 0
                              ).toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                fontSize: 12,
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                            }}
                          >
                            <Badge status={prop.status} />

                            {isSettled && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: '#0369A1',
                                  backgroundColor: '#E0F2FE',
                                  padding: '1px 5px',
                                  borderRadius: 3,
                                  width: 'fit-content',
                                }}
                              >
                                Settled
                              </span>
                            )}

                            {isRejected && prop.rejectedAt && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: 'var(--danger-text)',
                                }}
                              >
                                24h retention
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() =>
                              setSelectedProposal(prop)
                            }
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-body)',
                              border: '1px solid var(--border)',
                              fontWeight: 600,
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Details Modal */}
        {selectedProposal && (
          <div
            onClick={() => setSelectedProposal(null)}
            className="cbm-modal-backdrop"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="cbm-modal-content"
              style={{ maxWidth: 540 }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Proposal Record Details
                  </span>

                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--text-heading)',
                      marginTop: 2,
                    }}
                  >
                    {selectedProposal.proposalNumber ||
                      selectedProposal.proposalId ||
                      selectedProposal.id}
                  </h2>
                </div>

                <Badge status={selectedProposal.status} />
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Academic Year and Proposal Date */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Academic Year
                    </span>

                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-heading)',
                        marginTop: 1,
                      }}
                    >
                      {selectedProposal.academicYear || '—'}
                    </p>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Proposal Date
                    </span>

                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-body)',
                        marginTop: 1,
                      }}
                    >
                      {selectedProposal.proposalDate || '—'}
                    </p>
                  </div>
                </div>

                {/* Program Title */}
                <div
                  style={{
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Program Title
                  </span>

                  <p
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: 'var(--text-heading)',
                      marginTop: 1,
                    }}
                  >
                    {selectedProposal.title || '—'}
                  </p>
                </div>

                {/* Category and Program Date */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: 12,
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Category
                    </span>

                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-body)',
                        marginTop: 1,
                      }}
                    >
                      {selectedProposal.category || '—'}
                      {selectedProposal.subCategory
                        ? ` — ${selectedProposal.subCategory}`
                        : ''}
                    </p>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Program Date
                    </span>

                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--text-body)',
                        marginTop: 1,
                      }}
                    >
                      {selectedProposal.programDate || '—'}
                    </p>
                  </div>
                </div>

                {/* Guest Details */}
                <div
                  style={{
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Guest Details
                  </span>

                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-muted)',
                      marginTop: 1,
                    }}
                  >
                    {selectedProposal.guestDetails ||
                      'None specified'}
                  </p>
                </div>

                {/* Event Duration */}
                {(selectedProposal.eventDetails?.programmeDetails
                  ?.duration ||
                  selectedProposal.eventDetails?.programmeDetails
                    ?.durationHours) && (
                  <div
                    style={{
                      paddingBottom: 8,
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Event Duration
                    </span>

                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0369A1',
                        marginTop: 1,
                      }}
                    >
                      {selectedProposal.eventDetails?.programmeDetails
                        ?.duration ||
                        `${selectedProposal.eventDetails?.programmeDetails?.durationHours} Hours`}
                    </p>
                  </div>
                )}

                {/* Letter and Document Details */}
                {(selectedProposal.eventDetails?.letterId ||
                  selectedProposal.eventDetails?.documentDetails
                    ?.letterId ||
                  selectedProposal.eventDetails?.documentDetails
                    ?.fileName) && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                      gap: 12,
                      paddingBottom: 8,
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        Sanction Letter ID
                      </span>

                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--text-heading)',
                        }}
                      >
                        {selectedProposal.eventDetails?.letterId ||
                          selectedProposal.eventDetails?.documentDetails
                            ?.letterId ||
                          '—'}
                      </p>
                    </div>

                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        Document
                      </span>

                      <p
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'var(--primary)',
                        }}
                      >
                        {selectedProposal.eventDetails?.documentDetails
                          ?.fileName
                          ? `📄 ${selectedProposal.eventDetails.documentDetails.fileName}`
                          : 'No document attached'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Financial Details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      selectedProposal.settlementStatus === 'settled'
                        ? '1fr 1fr'
                        : '1fr',
                    gap: 12,
                    backgroundColor: 'var(--slate-50)',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}
                    >
                      Proposed Amount
                    </span>

                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: 'var(--text-heading)',
                        marginTop: 2,
                      }}
                    >
                      ₹
                      {Number(
                        selectedProposal.amount || 0
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {selectedProposal.settlementStatus === 'settled' && (
                    <div>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#0369A1',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        Finalized Settlement
                      </span>

                      <p
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: '#0369A1',
                          marginTop: 2,
                        }}
                      >
                        ₹
                        {Number(
                          selectedProposal.settlementAmount || 0
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Rejection Notice */}
                {String(selectedProposal.status || '').toLowerCase() ===
                  'rejected' && (
                  <div
                    style={{
                      padding: 10,
                      backgroundColor: 'var(--danger-bg)',
                      border: '1px solid var(--danger-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--danger-text)',
                      fontSize: 12,
                    }}
                  >
                    <strong>Rejection Notice:</strong> This proposal
                    was rejected by administration. Under departmental
                    retention policy, rejected proposals are scheduled
                    for automatic removal after 24 hours.
                  </div>
                )}

                {/* Admin Remarks */}
                {selectedProposal.adminRemarks && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--gold-subtle)',
                      border: '1px solid var(--gold-border)',
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--gold-text)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Admin Review Remarks
                    </span>

                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--text-heading)',
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {selectedProposal.adminRemarks}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Modal */}
              <button
                onClick={() => setSelectedProposal(null)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-body)',
                  border: '1px solid var(--border)',
                  fontWeight: 600,
                  fontSize: 12.5,
                  marginTop: 16,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
};
