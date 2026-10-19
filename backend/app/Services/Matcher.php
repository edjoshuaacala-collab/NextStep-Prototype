<?php

namespace App\Services;

use App\Models\Internship;

class Matcher
{
    private const ROLE_GROUPS = [
        'web' => [
            'web development', 'web developer', 'website development',
            'website developer', 'web application', 'frontend', 'front end',
            'backend', 'back end', 'full stack', 'software development',
            'software developer',
        ],
        'mobile' => [
            'mobile development', 'mobile developer', 'mobile app',
            'mobile application', 'app development', 'app developer',
            'android development', 'ios development',
        ],
        'data' => [
            'data analysis', 'data analyst', 'data analytics',
            'data science', 'business intelligence', 'data engineering',
        ],
        'design' => [
            'ui ux', 'ui/ux', 'ui design', 'ux design', 'user interface',
            'user experience', 'graphic design', 'web design', 'product design',
        ],
        'network' => [
            'networking', 'network engineer', 'network administration',
            'network administrator',
        ],
        'cyber' => [
            'cybersecurity', 'cyber security', 'information security',
            'security analyst', 'penetration testing',
        ],
        'quality' => [
            'quality assurance', 'qa tester', 'software testing',
            'test automation', 'manual testing',
        ],
        'machine' => [
            'artificial intelligence', 'machine learning', 'data science',
            'ai development',
        ],
        'game' => ['game development', 'game developer', 'game design'],
        'support' => [
            'it support', 'technical support', 'helpdesk', 'help desk',
            'desktop support',
        ],
        'database' => [
            'database administrator', 'database administration',
            'database developer', 'database management',
        ],
        'marketing' => [
            'digital marketing', 'marketing', 'social media',
            'content marketing', 'seo',
        ],
        'systems' => [
            'systems analysis', 'systems analyst', 'business systems',
            'business analyst',
        ],
        'cloud' => [
            'cloud computing', 'cloud engineer', 'devops', 'site reliability',
        ],
    ];

    private const SKILL_GROUPS = [
        'web' => [
            'html', 'css', 'javascript', 'typescript', 'react', 'vue',
            'angular', 'php', 'laravel', 'node.js', 'nodejs',
            'web development', 'website development', 'frontend',
            'front-end', 'backend', 'back-end', 'full stack',
            'rest api', 'api development',
        ],
        'mobile' => [
            'flutter', 'android', 'kotlin', 'swift', 'react native',
            'mobile development', 'mobile apps', 'mobile application',
        ],
        'data' => [
            'sql', 'excel', 'power bi', 'tableau', 'data analysis',
            'data analytics', 'data visualization', 'pandas',
            'statistics', 'data science',
        ],
        'design' => [
            'figma', 'ui/ux', 'ui ux', 'ui design', 'ux design',
            'graphic design', 'photoshop', 'canva',
        ],
        'network' => [
            'cisco', 'networking', 'network configuration', 'routing',
            'switching',
        ],
        'cyber' => [
            'cybersecurity', 'cyber security', 'penetration testing',
            'information security',
        ],
        'quality' => [
            'testing', 'manual testing', 'automation testing',
            'quality assurance', 'selenium',
        ],
        'machine' => [
            'python', 'machine learning', 'artificial intelligence',
            'pandas', 'tensorflow', 'pytorch',
        ],
        'game' => [
            'unity', 'unreal engine', 'game development', 'game design',
        ],
        'database' => [
            'mysql', 'mongodb', 'postgresql', 'database',
            'database management',
        ],
        'cloud' => [
            'linux', 'docker', 'kubernetes', 'aws', 'azure',
            'cloud computing', 'devops',
        ],
        'marketing' => [
            'marketing', 'social media', 'seo', 'content creation',
            'digital marketing',
        ],
        'support' => [
            'it support', 'technical support', 'helpdesk', 'troubleshooting',
        ],
    ];

    public static function recommend(
        string $text,
        int $limit = 3,
        ?string $workSetup = null,
        array $excludeIds = []
    ): array {
        $text = mb_strtolower(trim($text));
        $matchingText = self::removeNegatedPreferences($text);

        $limit = max(1, min($limit, 50));

        $excludeIds = array_values(array_unique(array_filter(
            array_map('intval', $excludeIds),
            fn ($id) => $id > 0
        )));

        $preferredSetup = self::normalizeSetup($workSetup);

        $internships = Internship::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('deadline')
                    ->orWhereDate('deadline', '>=', today()->toDateString());
            })
            ->get();

        $results = [];

        foreach ($internships as $internship) {
            if (in_array((int) $internship->id, $excludeIds, true)) {
                continue;
            }

            $skills = self::normalizeSkills($internship->skills ?? []);

            $listingText = mb_strtolower(trim(
                (string) ($internship->title ?? '') . ' ' .
                (string) ($internship->role_category ?? '')
            ));

            $score = 0;
            $matched = [];
            $matchedRoles = [];

            // Match listed skills against the student's non-negated text.
            foreach ($skills as $skill) {
                if (self::containsTerm($matchingText, $skill)) {
                    $score += 3;
                    $matched[] = 'skill: ' . $skill;
                }
            }

            // Match stated role preferences to listing titles/categories.
            foreach (self::ROLE_GROUPS as $group => $terms) {
                $studentMentionsRole = false;

                foreach ($terms as $term) {
                    if (self::containsTerm($matchingText, $term)) {
                        $studentMentionsRole = true;
                        break;
                    }
                }

                if (! $studentMentionsRole) {
                    continue;
                }

                foreach ($terms as $term) {
                    if (self::containsTerm($listingText, $term)) {
                        if (! in_array($group, $matchedRoles, true)) {
                            $matchedRoles[] = $group;
                            $score += 5;
                            $matched[] = 'role: ' . $group;
                        }
                        break;
                    }
                }
            }

            // Skills may support a role, but do not qualify unrelated listings.
            foreach (self::SKILL_GROUPS as $group => $terms) {
                $studentMentionsGroup = false;

                foreach ($terms as $term) {
                    if (self::containsTerm($matchingText, $term)) {
                        $studentMentionsGroup = true;
                        break;
                    }
                }

                if (! $studentMentionsGroup) {
                    continue;
                }

                $listingMatchesGroup = false;

                foreach (self::ROLE_GROUPS[$group] ?? [] as $term) {
                    if (self::containsTerm($listingText, $term)) {
                        $listingMatchesGroup = true;
                        break;
                    }
                }

                if (
                    $listingMatchesGroup
                    && ! in_array($group, $matchedRoles, true)
                ) {
                    $matchedRoles[] = $group;
                    $score += 2;
                    $matched[] = 'role: ' . $group;
                }
            }

            $location = trim((string) ($internship->location ?? ''));

            if (
                $location !== ''
                && self::containsTerm($matchingText, $location)
            ) {
                $score += 1;
                $matched[] = 'location: ' . $location;
            }

           
$actualSetup = self::normalizeSetup(
    (string) ($internship->work_setup ?? '')
);

$setupMatches = $preferredSetup !== null
    && $actualSetup !== null
    && $actualSetup === $preferredSetup;

// If the student explicitly selected a setup, do not rank
// a different setup as an exact match.
if (
    $preferredSetup !== null
    && $actualSetup !== null
    && $actualSetup !== $preferredSetup
) {
    continue;
}

if ($setupMatches) {
    $score += 4;
    $matched[] = 'work setup: ' . $actualSetup;
}


            // Setup/location alone cannot qualify a listing.
            $hasRoleMatch = count($matchedRoles) > 0;
            $hasSkillMatch = count(array_filter(
                $matched,
                fn ($item) => str_starts_with($item, 'skill:')
            )) > 0;

            if (! $hasRoleMatch && ! $hasSkillMatch) {
                continue;
            }

            $results[] = [
                'internship' => $internship,
                'score' => $score,
                'matched' => array_values(array_unique($matched)),
                'role_matches' => $matchedRoles,
            ];
        }

        usort($results, function ($a, $b) {
            $comparison = $b['score'] <=> $a['score'];

            return $comparison !== 0
                ? $comparison
                : ((int) $a['internship']->id
                    <=> (int) $b['internship']->id);
        });

        return array_map(
            fn ($result) => array_merge(
                $result['internship']->toArray(),
                [
                    'matched' => $result['matched'],
                    'score' => $result['score'],
                ]
            ),
            array_slice($results, 0, $limit)
        );
    }

    private static function removeNegatedPreferences(string $text): string
    {
        $patterns = [
            '/\b(?:i\s+)?(?:do\s+not|don\'t|dont)\s+'
                . '(?:want|like|prefer|need)\b[^.!?;,\n]*/iu',
            '/\bnot\s+interested\s+in\b[^.!?;,\n]*/iu',
            '/\bnot\s+looking\s+for\b[^.!?;,\n]*/iu',
            '/\b(?:avoid|excluding|except)\b[^.!?;,\n]*/iu',
        ];

        return trim(preg_replace($patterns, ' ', $text) ?? $text);
    }

    private static function normalizeSkills(mixed $skills): array
    {
        if (is_string($skills)) {
            $decoded = json_decode($skills, true);

            $skills = is_array($decoded)
                ? $decoded
                : (preg_split('/[,;\n]+/', $skills) ?: [$skills]);
        }

        if (! is_array($skills)) {
            return [];
        }

        $normalized = [];

        foreach ($skills as $skill) {
            if (! is_string($skill) && ! is_numeric($skill)) {
                continue;
            }

            $skill = mb_strtolower(trim((string) $skill));

            if ($skill !== '') {
                $normalized[] = $skill;
            }
        }

        return array_values(array_unique($normalized));
    }

    private static function normalizeSetup(?string $setup): ?string
    {
        if ($setup === null || trim($setup) === '') {
            return null;
        }

        $setup = mb_strtolower(trim($setup));

        if (in_array($setup, ['remote', 'work from home', 'wfh'], true)) {
            return 'remote';
        }

        if (in_array($setup, ['hybrid', 'hybrid work'], true)) {
            return 'hybrid';
        }

        if (in_array($setup, ['onsite', 'on-site', 'on site', 'office'], true)) {
            return 'onsite';
        }

        return null;
    }

    private static function containsTerm(string $text, string $term): bool
    {
        $term = trim(mb_strtolower($term));

        if ($text === '' || $term === '') {
            return false;
        }

        $pattern = '/(?<![\p{L}\p{N}])'
            . preg_quote($term, '/')
            . '(?![\p{L}\p{N}])/iu';

        return preg_match($pattern, $text) === 1;
    }
}
