-- 1. Create Bots Table
CREATE TABLE IF NOT EXISTS bots (
  bot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  league_tier TEXT CHECK (league_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  personality TEXT CHECK (personality IN ('lazy', 'steady', 'aggressive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Leaderboard Cohorts Table
CREATE TABLE IF NOT EXISTS leaderboard_cohorts (
  cohort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start_date DATE NOT NULL,
  league_tier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Cohort Members Table
CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES leaderboard_cohorts(cohort_id) ON DELETE CASCADE,
  member_id UUID NOT NULL, -- Can be a user_id or a bot_id
  member_type TEXT CHECK (member_type IN ('user', 'bot')),
  weekly_xp INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add current_cohort_id to profiles (if not exists)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_cohort_id UUID REFERENCES leaderboard_cohorts(cohort_id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_result_seen BOOLEAN DEFAULT FALSE;

-- 5. Seed initial bots (Example 20 per league)
-- Bronze Bots
INSERT INTO bots (display_name, avatar_seed, league_tier, personality) VALUES
('FocusNinja42', 'ninja1', 'Bronze', 'steady'),
('DeepWorkDave', 'dave2', 'Bronze', 'lazy'),
('ZenCoder', 'coder3', 'Bronze', 'aggressive'),
('PomodoroPro', 'pro4', 'Bronze', 'steady'),
('QuietMind', 'mind5', 'Bronze', 'lazy'),
('FocusFriend', 'friend6', 'Bronze', 'steady'),
('WorkWarrior', 'warrior7', 'Bronze', 'aggressive'),
('StudyBuddy', 'buddy8', 'Bronze', 'steady'),
('ProductivePete', 'pete9', 'Bronze', 'lazy'),
('TaskTamer', 'tamer10', 'Bronze', 'steady');

-- Silver Bots
INSERT INTO bots (display_name, avatar_seed, league_tier, personality) VALUES
('SilverSurfer', 'surfer1', 'Silver', 'aggressive'),
('FlowState', 'flow2', 'Silver', 'steady'),
('MomentumMax', 'max3', 'Silver', 'steady'),
('TheArchitect', 'arch4', 'Silver', 'lazy'),
('CodeCrusher', 'code5', 'Silver', 'aggressive'),
('BrainBox', 'box6', 'Silver', 'steady'),
('FocusFanatic', 'fan7', 'Silver', 'steady'),
('SteadyHand', 'hand8', 'Silver', 'lazy'),
('PeakPerformer', 'peak9', 'Silver', 'aggressive'),
('DailyDoer', 'doer10', 'Silver', 'steady');

-- Gold Bots
INSERT INTO bots (display_name, avatar_seed, league_tier, personality) VALUES
('GoldStandard', 'gold1', 'Gold', 'aggressive'),
('Aurelius', 'aur2', 'Gold', 'steady'),
('Solana', 'sol3', 'Gold', 'steady'),
('MidasTouch', 'mid4', 'Gold', 'lazy'),
('VictoryLap', 'vic5', 'Gold', 'aggressive'),
('ChampionMind', 'champ6', 'Gold', 'steady'),
('Mastermind', 'mast7', 'Gold', 'steady'),
('PeakFocus', 'peak8', 'Gold', 'lazy'),
('EliteWorker', 'elite9', 'Gold', 'aggressive'),
('GoldGetter', 'get10', 'Gold', 'steady');

-- Platinum Bots
INSERT INTO bots (display_name, avatar_seed, league_tier, personality) VALUES
('PlatPower', 'plat1', 'Platinum', 'aggressive'),
('DiamondDream', 'diam2', 'Platinum', 'steady'),
('Titanium', 'titan3', 'Platinum', 'steady'),
('Obsidian', 'obs4', 'Platinum', 'lazy'),
('Ethereal', 'eth5', 'Platinum', 'aggressive'),
('GalaxyBrain', 'gal6', 'Platinum', 'steady'),
('InfinityFocus', 'inf7', 'Platinum', 'steady'),
('AbsoluteZero', 'zero8', 'Platinum', 'lazy'),
('Overclocked', 'over9', 'Platinum', 'aggressive'),
('FinalBoss', 'boss10', 'Platinum', 'steady');

-- 6. Enable Realtime for cohort_members
ALTER PUBLICATION supabase_realtime ADD TABLE cohort_members;
