import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey || supabaseUrl.includes('your-project')) {
  console.log('⚠️ Note: Valid SUPABASE_URL and SUPABASE_SECRET_KEY in server/.env are required to run database seeding.');
}

const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseSecretKey || 'placeholder', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function seedDatabase() {
  console.log('🚀 Starting Kongu CSE Budget Management Database Seed...');

  try {
    // 1. Seed Department
    console.log('🏢 Seeding Department...');
    const { data: existingDept } = await supabaseAdmin
      .from('departments')
      .select('*')
      .eq('code', 'CSE')
      .maybeSingle();

    let deptId = existingDept?.id;
    if (!existingDept) {
      const { data: newDept, error: deptError } = await supabaseAdmin
        .from('departments')
        .insert({
          name: 'Computer Science and Engineering (CSE)',
          code: 'CSE'
        })
        .select()
        .single();

      if (deptError) throw deptError;
      deptId = newDept.id;
      console.log('✅ Department CSE created.');
    } else {
      console.log('ℹ️ Department CSE already exists.');
    }

    // 2. Seed Admin User
    console.log('👤 Seeding System Admin...');
    const adminEmail = 'admin@kongu.edu';
    const defaultPassword = 'kongu@123';

    const { data: adminUsers } = await supabaseAdmin.auth.admin.listUsers();
    let adminAuthUser = adminUsers?.users?.find(u => u.email === adminEmail);

    if (!adminAuthUser) {
      const { data: newAdminUser, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: { name: 'System Admin', role: 'admin' }
      });
      if (adminAuthError) throw adminAuthError;
      adminAuthUser = newAdminUser.user;
      console.log('✅ Admin auth user created.');
    } else {
      await supabaseAdmin.auth.admin.updateUserById(adminAuthUser.id, {
        password: defaultPassword,
        email_confirm: true
      });
      console.log('✅ Admin password updated to default.');
    }

    // Upsert Admin Profile
    await supabaseAdmin.from('profiles').upsert({
      id: adminAuthUser.id,
      name: 'System Admin',
      email: adminEmail,
      role: 'admin',
      employee_id: 'ADM001',
      designation: 'Chief Budget Administrator',
      department_id: deptId,
      phone: '+91 98421 00000',
      status: 'Active'
    });
    console.log('✅ Admin profile verified.');

    // 3. Seed Faculty Users
    console.log('👥 Seeding Faculty Members...');
    const initialFacultyList = [
      {
        name: 'Dr. Arun Kumar',
        email: 'arun@kongu.edu',
        designation: 'Professor',
        employee_id: 'FAC001',
        phone: '+91 98421 12345',
        status: 'Active'
      },
      {
        name: 'Dr. Priya S',
        email: 'priya@kongu.edu',
        designation: 'Assistant Professor',
        employee_id: 'FAC002',
        phone: '+91 97890 23456',
        status: 'Active'
      },
      {
        name: 'Dr. Karthik R',
        email: 'karthik@kongu.edu',
        designation: 'Associate Professor',
        employee_id: 'FAC003',
        phone: '+91 94432 34567',
        status: 'Active'
      },
      {
        name: 'Dr. Meena Sundaram',
        email: 'meena@kongu.edu',
        designation: 'Professor',
        employee_id: 'FAC004',
        phone: '+91 99441 45678',
        status: 'Active'
      },
      {
        name: 'Prof. Rajesh V',
        email: 'rajesh@kongu.edu',
        designation: 'Associate Professor',
        employee_id: 'FAC005',
        phone: '+91 98650 56789',
        status: 'Active'
      },
      {
        name: 'Dr. Anitha P',
        email: 'anitha@kongu.edu',
        designation: 'HOD',
        employee_id: 'FAC006',
        phone: '+91 97512 67890',
        status: 'Active'
      }
    ];

    const facultyProfileMap = {};

    for (const fac of initialFacultyList) {
      let facUser = adminUsers?.users?.find(u => u.email === fac.email);
      if (!facUser) {
        const { data: newFacUser, error: facErr } = await supabaseAdmin.auth.admin.createUser({
          email: fac.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: { name: fac.name, role: 'faculty' }
        });
        if (facErr) {
          console.warn(`Could not create auth for ${fac.email}: ${facErr.message}`);
        } else {
          facUser = newFacUser.user;
        }
      } else {
        await supabaseAdmin.auth.admin.updateUserById(facUser.id, {
          password: defaultPassword,
          email_confirm: true
        });
      }

      if (facUser) {
        const { data: profData } = await supabaseAdmin.from('profiles').upsert({
          id: facUser.id,
          name: fac.name,
          email: fac.email,
          role: 'faculty',
          employee_id: fac.employee_id,
          designation: fac.designation,
          department_id: deptId,
          phone: fac.phone,
          status: fac.status
        }).select().single();

        facultyProfileMap[fac.email] = profData?.id || facUser.id;
      }
    }
    console.log('✅ Faculty accounts verified.');

    // 4. Seed Academic Years (Categories with Direct Budgets & Subcategories without separate budgets)
    console.log('📅 Seeding Academic Years & Categories...');
    const academicYearsSeeds = [
      {
        start_year: 2026,
        end_year: 2027,
        name: '2026 - 2027',
        academic_year: '2026-2027',
        status: 'ACTIVE',
        is_active: true,
        annual_budget: 2060000,
        budget: 2060000,
        categories: [
          {
            name: 'CSEA Association',
            description: 'Primary departmental student association driving technical symposiums, workshops, and guest lectures.',
            budget: 450000,
            subcategories: [
              { name: 'Renaissance' },
              { name: 'Workshop' },
              { name: 'Guest Lecture' },
              { name: 'Validation' },
              { name: 'Inaugural' },
              { name: 'Partial Guest Lecture' },
              { name: 'Orientation' },
              { name: 'Crescita' },
              { name: 'Senior-Junior Interaction' }
            ]
          },
          {
            name: 'CCC Coding Club',
            description: 'Specialized CSE algorithmic coding hub fostering competitive programming, hackathons, and open-source sprints.',
            budget: 350000,
            subcategories: [
              { name: 'Coding Contest' },
              { name: 'Training' },
              { name: 'Hackathon' }
            ]
          },
          {
            name: 'Lab & Equipment',
            description: 'Hardware, software licenses, lab infrastructure upgrades, and networking equipment.',
            budget: 520000,
            subcategories: [
              { name: 'Hardware Upgrade' },
              { name: 'Software Licenses' },
              { name: 'Networking Infrastructure' }
            ]
          },
          {
            name: 'Technical Workshop',
            description: 'Hands-on technical workshops, tool training, and student skill enhancement.',
            budget: 240000,
            subcategories: [
              { name: 'Technical Workshop' },
              { name: 'Non-Technical Workshop' }
            ]
          },
          {
            name: 'Department Maintenance',
            description: 'Departmental upkeep, consumables, printing quotas, stationery, and routine maintenance.',
            budget: 160000,
            subcategories: [
              { name: 'Lab Maintenance' },
              { name: 'Office Consumables' }
            ]
          },
          {
            name: 'Academic Research',
            description: 'Faculty and student research projects, paper publications, patents, and seed funding.',
            budget: 100000,
            subcategories: [
              { name: 'Paper Publications' },
              { name: 'Patent Filings' }
            ]
          },
          {
            name: 'Technical Workshops',
            description: 'Advanced technical certifications and faculty development programs.',
            budget: 240000,
            subcategories: []
          }
        ]
      },
      {
        start_year: 2027,
        end_year: 2028,
        name: '2027 - 2028',
        academic_year: '2027-2028',
        status: 'DRAFT',
        is_active: false,
        annual_budget: 600000,
        budget: 600000,
        categories: [
          {
            name: 'Guest Lecture',
            description: 'Expert talks for 2027-28',
            budget: 100000,
            subcategories: [
              { name: 'External Guest Lecture' },
              { name: 'Industry Guest Lecture' }
            ]
          },
          {
            name: 'Workshop & Hands-on Lab',
            description: 'Hands-on practical sessions',
            budget: 200000,
            subcategories: []
          },
          {
            name: 'Symposium & Competitions',
            description: 'National Level Technical Symposium',
            budget: 300000,
            subcategories: []
          }
        ]
      }
    ];

    for (const aySeed of academicYearsSeeds) {
      try {
        const { data: existingAy } = await supabaseAdmin
          .from('academic_years')
          .select('*')
          .or(`academic_year.eq.${aySeed.academic_year},name.eq.${aySeed.name}`)
          .maybeSingle();

        let ayId = existingAy?.id;

        if (!existingAy) {
          const { data: newAy } = await supabaseAdmin
            .from('academic_years')
            .insert({
              academic_year: aySeed.academic_year,
              status: aySeed.status,
              is_active: aySeed.is_active,
              budget: aySeed.budget
            })
            .select()
            .single();
          ayId = newAy?.id;
        } else {
          await supabaseAdmin
            .from('academic_years')
            .update({
              academic_year: aySeed.academic_year,
              status: aySeed.status,
              is_active: aySeed.is_active,
              budget: aySeed.budget
            })
            .eq('id', existingAy.id);
        }

        // Seed categories, category budgets, subcategories
        if (ayId) {
          try {
            for (const catSeed of aySeed.categories) {
              const { data: catData } = await supabaseAdmin
                .from('categories')
                .upsert({
                  academic_year_id: ayId,
                  name: catSeed.name,
                  description: catSeed.description
                }, { onConflict: 'academic_year_id,name' })
                .select()
                .single();

              if (catData) {
                const catId = catData.id;

                // Category budget
                await supabaseAdmin
                  .from('category_budgets')
                  .upsert({
                    category_id: catId,
                    amount: catSeed.budget
                  }, { onConflict: 'category_id' });

                // Subcategories (classification only, NO budget)
                if (catSeed.subcategories) {
                  for (const subSeed of catSeed.subcategories) {
                    await supabaseAdmin
                      .from('subcategories')
                      .upsert({
                        category_id: catId,
                        name: subSeed.name
                      }, { onConflict: 'category_id,name' });
                  }
                }
              }
            }
          } catch (tblErr) {
            console.warn(`Note on enhanced tables seeding: ${tblErr.message}`);
          }
        }
      } catch (err) {
        console.warn(`Could not seed academic year ${aySeed.name}: ${err.message}`);
      }
    }
    console.log('✅ Academic Years & Categories verified.');

    // 5. Seed Legacy Budget & Categories (FY 2026-27)
    console.log('💰 Seeding Department General Budget...');
    let { data: existingBudget } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('department_id', deptId)
      .eq('financial_year', '2026-27')
      .maybeSingle();

    let budgetId = existingBudget?.id;
    if (!existingBudget) {
      const { data: newBudget, error: bErr } = await supabaseAdmin
        .from('budgets')
        .insert({
          department_id: deptId,
          financial_year: '2026-27',
          total_budget: 2450000
        })
        .select()
        .single();
      if (bErr) throw bErr;
      budgetId = newBudget.id;
      console.log('✅ Budget for FY 2026-27 created: ₹24,50,000');
    }

    const categorySeeds = [
      { name: 'CSEA Association', allocated_amount: 450000, spent_amount: 320000 },
      { name: 'CCC Coding Club', allocated_amount: 350000, spent_amount: 240000 },
      { name: 'Lab & Equipment', allocated_amount: 520000, spent_amount: 390000 },
      { name: 'Technical Workshop', allocated_amount: 240000, spent_amount: 165000 },
      { name: 'Department Maintenance', allocated_amount: 160000, spent_amount: 95000 },
      { name: 'Academic Research', allocated_amount: 100000, spent_amount: 35000 }
    ];

    const categoryMap = {};
    for (const cat of categorySeeds) {
      const { data: existingCat } = await supabaseAdmin
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId)
        .eq('name', cat.name)
        .maybeSingle();

      if (!existingCat) {
        const { data: newCat } = await supabaseAdmin
          .from('budget_categories')
          .insert({
            budget_id: budgetId,
            name: cat.name,
            allocated_amount: cat.allocated_amount,
            spent_amount: cat.spent_amount
          })
          .select()
          .single();
        categoryMap[cat.name] = newCat?.id;
      } else {
        categoryMap[cat.name] = existingCat.id;
      }
    }
    console.log('✅ Legacy budget categories verified.');

    console.log('🎉 Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

// If run directly via node seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
