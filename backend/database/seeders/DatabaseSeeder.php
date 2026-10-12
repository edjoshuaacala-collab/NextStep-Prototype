<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $list = [
            ['Junior Web Developer Intern', 'Bluepeak Software Inc.', 'Web Development', 'Quezon City', 'Hybrid', 'Build responsive web features for client dashboards using React and Laravel under a senior developer.', ['Web development', 'React', 'Laravel', 'MySQL', 'JavaScript'], 3, '₱6,000/month'],
            ['Data Analyst Intern', 'Harbor Analytics', 'Data & Analytics', 'Makati', 'Onsite', 'Clean datasets, write SQL queries and build weekly Excel and Power BI reports for logistics clients.', ['Databases', 'SQL', 'Excel', 'Python', 'Power BI'], 2, '₱7,000/month'],
            ['UI/UX Design Intern', 'Kalye Digital Studio', 'Design', 'Mandaluyong', 'Hybrid', 'Support user research, wireframing and prototyping for mobile and web products.', ['Figma', 'User research', 'Wireframing', 'Prototyping'], 2, '₱5,500/month'],
            ['Network Support Intern', 'NorthGate Systems', 'IT Support & Networking', 'Pasig', 'Onsite', 'Assist the network team with cabling, router configuration and troubleshooting for office clients.', ['Networking', 'Troubleshooting', 'Cisco', 'Windows Server'], 4, '₱5,000/month'],
            ['Mobile App Developer Intern', 'Pinya Labs', 'Mobile Development', 'Taguig', 'Hybrid', 'Develop and test Flutter screens for a consumer budgeting app connected to Firebase.', ['Flutter', 'Dart', 'Firebase', 'Android'], 2, '₱6,500/month'],
            ['Cybersecurity Analyst Intern', 'Bantay Secure Corp.', 'Cybersecurity', 'Pasig', 'Onsite', 'Monitor security alerts, run vulnerability scans and document incidents with the SOC team.', ['Cybersecurity', 'Network security', 'Linux', 'SIEM'], 2, '₱7,500/month'],
            ['QA Tester Intern', 'Tala Testing Co.', 'Quality Assurance', 'Quezon City', 'Remote', 'Write test cases, run manual and Selenium tests, and report bugs for web applications.', ['Test cases', 'Selenium', 'Bug reporting', 'JavaScript'], 3, '₱5,500/month'],
            ['Backend Developer Intern (PHP)', 'Luntian Tech Solutions', 'Web Development', 'Manila', 'Hybrid', 'Create REST APIs and database migrations for an agri-supply platform using Laravel.', ['PHP', 'Laravel', 'MySQL', 'REST APIs', 'Git'], 2, '₱6,000/month'],
            ['IT Helpdesk Intern', 'Sampaguita Health Network', 'IT Support & Networking', 'Parañaque', 'Onsite', 'Resolve hardware and software tickets for clinic staff and maintain asset records.', ['Troubleshooting', 'Customer service', 'Windows', 'Ticketing'], 3, '₱5,000/month'],
            ['Digital Marketing Intern', 'Alon Creative Agency', 'Digital Marketing', 'Makati', 'Hybrid', 'Plan social media posts, track SEO keywords and design simple campaign visuals in Canva.', ['Social media', 'SEO', 'Canva', 'Content writing'], 2, '₱5,000/month'],
            ['Machine Learning Intern', 'Tagpi AI Research', 'AI & Machine Learning', 'Taguig', 'Hybrid', 'Prepare datasets and train baseline models for Filipino-language text classification.', ['Python', 'Machine learning', 'Pandas', 'TensorFlow'], 1, '₱8,000/month'],
            ['Database Administrator Intern', 'Mayon Finance Corp.', 'Database Administration', 'Makati', 'Onsite', 'Assist with MySQL backups, indexing and schema documentation for internal finance systems.', ['MySQL', 'SQL', 'Database design', 'Backup'], 2, '₱7,000/month'],
            ['Game Developer Intern', 'Pixel Palay Studios', 'Game Development', 'Quezon City', 'Onsite', 'Prototype gameplay features in Unity for an upcoming casual mobile game.', ['Unity', 'C#', 'Game design'], 2, '₱6,000/month'],
            ['Systems Analyst Intern', 'Kalikasan Logistics', 'Systems Analysis', 'Pasig', 'Hybrid', 'Gather requirements, draw UML diagrams and write system documentation for a fleet tracking tool.', ['Requirements gathering', 'UML', 'Documentation', 'SQL'], 2, '₱6,000/month'],
        ];

        foreach ($list as $i => [$title, $company, $cat, $loc, $setup, $desc, $skills, $slots, $allow]) {
            Internship::updateOrCreate(['title' => $title, 'company' => $company], [
                'role_category' => $cat, 'location' => $loc, 'work_setup' => $setup, 'description' => $desc,
                'skills' => $skills, 'slots' => $slots, 'duration' => '300 hours', 'allowance' => $allow,
                'deadline' => now()->addDays(30 + $i * 3)->toDateString(), 'is_active' => true,
            ]);
        }

        $alex = User::updateOrCreate(['email' => 'alex@jru.edu'], [
            'name' => 'Alex Rivera',
            'student_number' => '2023-01234',
            'password' => 'password123',
            'program' => 'Computer Science and Engineering',
            'year_level' => 3,
            'skills' => ['Web development', 'React', 'Laravel', 'MySQL', 'SQL'],
            'profile_completeness' => 85,
        ]);

        $bluepeak = Internship::where('company', 'Bluepeak Software Inc.')->first();
        $harbor = Internship::where('company', 'Harbor Analytics')->first();
        Application::updateOrCreate(['user_id' => $alex->id, 'internship_id' => $bluepeak->id], ['status' => 'Under review', 'cover_note' => 'Excited to build with React and Laravel.']);
        Application::updateOrCreate(['user_id' => $alex->id, 'internship_id' => $harbor->id], ['status' => 'Endorsed', 'cover_note' => 'I enjoy SQL and data reporting.']);
    }
}
