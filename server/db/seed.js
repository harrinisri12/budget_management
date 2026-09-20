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

    // 4. Seed Budget (FY 2026-27 - ₹24.5 Lakhs)
    console.log('💰 Seeding Annual Budget...');
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

    // 5. Seed Budget Categories
    console.log('📊 Seeding Budget Categories...');
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
    console.log('✅ Budget categories verified.');

    // 6. Seed Initial Proposals
    console.log('📝 Seeding Initial Proposals...');
    const arunId = facultyProfileMap['arun@kongu.edu'];
    const priyaId = facultyProfileMap['priya@kongu.edu'];
    const rajeshId = facultyProfileMap['rajesh@kongu.edu'];
    const karthikId = facultyProfileMap['karthik@kongu.edu'];

    const initialProposals = [
      {
        proposal_number: 'PROP-2026-001',
        faculty_id: arunId,
        category_name: 'CSEA Association',
        title: 'CSEA Technical Symposium (OPUS 2026)',
        proposal_date: '2026-09-18',
        program_date: '2026-09-25',
        guest_details: 'Dr. Arun Kumar, Senior Software Engineer, ABC Technologies',
        amount: 35000,
        status: 'Approved'
      },
      {
        proposal_number: 'PROP-2026-002',
        faculty_id: priyaId,
        category_name: 'CCC Coding Club',
        title: 'CCC Algorithmic Coding Contest',
        proposal_date: '2026-09-17',
        program_date: '2026-09-30',
        guest_details: 'Prof. Ramesh G, ACM Chapter Chair',
        amount: 12500,
        status: 'Pending'
      },
      {
        proposal_number: 'PROP-2026-003',
        faculty_id: rajeshId,
        category_name: 'Lab & Equipment',
        title: 'High-performance AI workstation GPU upgrade for CSE Lab 3',
        proposal_date: '2026-09-15',
        program_date: '2026-10-05',
        guest_details: 'Dell Technical Sales Team',
        amount: 28000,
        status: 'Approved'
      },
      {
        proposal_number: 'PROP-2026-004',
        faculty_id: karthikId,
        category_name: 'Technical Workshop',
        title: 'Hands-on Cloud Computing & DevOps workshop',
        proposal_date: '2026-09-14',
        program_date: '2026-10-12',
        guest_details: 'AWS Authorized Trainer',
        amount: 18000,
        status: 'Under Review'
      }
    ];

    for (const p of initialProposals) {
      const catId = categoryMap[p.category_name] || Object.values(categoryMap)[0];
      if (p.faculty_id && catId) {
        await supabaseAdmin.from('proposals').upsert({
          proposal_number: p.proposal_number,
          faculty_id: p.faculty_id,
          category_id: catId,
          title: p.title,
          proposal_date: p.proposal_date,
          program_date: p.program_date,
          guest_details: p.guest_details,
          amount: p.amount,
          status: p.status
        }, { onConflict: 'proposal_number' });
      }
    }
    console.log('✅ Proposals verified.');

    // 7. Seed Initial Transactions
    console.log('💳 Seeding Initial Transactions...');
    const sampleTransactions = [
      {
        transaction_number: 'TXN-901',
        category_name: 'CSEA Association',
        amount: 45000,
        transaction_date: '2026-09-18',
        status: 'Approved',
        description: 'National Level Technical Symposium guest honorarium & stage setup',
        requested_email: 'arun@kongu.edu',
        vendor: 'Kongu Events & Hospitality'
      },
      {
        transaction_number: 'TXN-902',
        category_name: 'CCC Coding Club',
        amount: 12500,
        transaction_date: '2026-09-17',
        status: 'Pending',
        description: 'Inter-College Algorithmic Coding Contest cash prizes & trophies',
        requested_email: 'priya@kongu.edu',
        vendor: 'CCC Student Chapter'
      },
      {
        transaction_number: 'TXN-903',
        category_name: 'Lab & Equipment',
        amount: 28000,
        transaction_date: '2026-09-16',
        status: 'Approved',
        description: 'High-performance AI workstation GPU upgrade for CSE Lab 3',
        requested_email: 'rajesh@kongu.edu',
        vendor: 'Dell Technologies Ltd'
      },
      {
        transaction_number: 'TXN-904',
        category_name: 'Technical Workshop',
        amount: 18000,
        transaction_date: '2026-09-14',
        status: 'Approved',
        description: 'Hands-on Cloud Computing & DevOps workshop trainer honorarium',
        requested_email: 'karthik@kongu.edu',
        vendor: 'AWS Academy Partner'
      },
      {
        transaction_number: 'TXN-905',
        category_name: 'CSEA Association',
        amount: 35000,
        transaction_date: '2026-09-12',
        status: 'Pending',
        description: 'Industrial Guest Lecture series on Generative AI by industry leaders',
        requested_email: 'meena@kongu.edu',
        vendor: 'Tech Talks India'
      },
      {
        transaction_number: 'TXN-906',
        category_name: 'CCC Coding Club',
        amount: 65000,
        transaction_date: '2026-09-10',
        status: 'Approved',
        description: 'Annual Hackathon server infrastructure & cloud compute credits',
        requested_email: 'anitha@kongu.edu',
        vendor: 'Google Cloud Academic'
      },
      {
        transaction_number: 'TXN-907',
        category_name: 'Lab & Equipment',
        amount: 52000,
        transaction_date: '2026-09-08',
        status: 'Approved',
        description: 'Cisco L3 switches & Gigabit patch cables for CSE IoT Lab',
        requested_email: 'arun@kongu.edu',
        vendor: 'Cisco Networking Systems'
      },
      {
        transaction_number: 'TXN-908',
        category_name: 'Department Maintenance',
        amount: 8500,
        transaction_date: '2026-09-05',
        status: 'Rejected',
        description: 'Unplanned printer ink refill outside departmental quota',
        requested_email: 'priya@kongu.edu',
        vendor: 'Local Office Mart'
      }
    ];

    for (const txn of sampleTransactions) {
      const catId = categoryMap[txn.category_name] || null;
      const reqId = facultyProfileMap[txn.requested_email] || null;

      await supabaseAdmin.from('transactions').upsert({
        transaction_number: txn.transaction_number,
        department_id: deptId,
        category_id: catId,
        amount: txn.amount,
        transaction_date: txn.transaction_date,
        status: txn.status,
        description: txn.description,
        requested_by: reqId,
        vendor: txn.vendor
      }, { onConflict: 'transaction_number' });
    }
    console.log('✅ Transactions verified.');

    console.log('🎉 Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

// If run directly via node seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
