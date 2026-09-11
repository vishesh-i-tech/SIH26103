-- ==============================================================================
-- PAIMANA AI — MoSPI Infrastructure Project Monitoring Platform
-- Seed Data: 10 Synthetic Central Sector Projects (₹150 Cr+)
-- ==============================================================================

-- Note on created_by & submitted_by:
-- These are set to NULL by default so seed data can be imported before user registration.
-- Once an Admin or Field Officer account is registered in Supabase, you can optionally
-- assign ownership using:
-- UPDATE public.projects SET created_by = '<admin-user-id>';
-- UPDATE public.daily_entries SET submitted_by = '<field-officer-user-id>';

DO $$
DECLARE
  v_nh4471 UUID;
  v_br2209 UUID;
  v_rw8802 UUID;
  v_pw3341 UUID;
  v_nh5510 UUID;
  v_rw9104 UUID;
  v_br1402 UUID;
  v_pw4902 UUID;
  v_nh6218 UUID;
  v_rw7319 UUID;
BEGIN

  -- 1. NH-4471
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'NH-4471', 'Indore–Betul Highway Widening (Package 2)', 'Roads', 'Madhya Pradesh', 'Shivalik Infraprojects Ltd.',
    640, 705, '2024-02-01', 36, '2027-02-01',
    68, 47, 87,
    'Expenditure outpacing physical work & forest land diversion delays',
    'Escalate material-supply contract to Divisional Engineer; freeze further RA-bill approval pending site verification.',
    6
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_nh4471;

  -- 2. BR-2209
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'BR-2209', 'Narmada River Bridge, Hoshangabad', 'Bridges', 'Madhya Pradesh', 'Ganga Construction Co.',
    310, 338, '2024-06-01', 24, '2026-06-01',
    55, 49, 61,
    'Monsoon-linked high water work stoppage & pier foundation clearance',
    'Revise schedule buffer for monsoon months in next quarterly review; approve nighttime batching plant operations.',
    2
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_br2209;

  -- 3. RW-8802
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'RW-8802', 'Bhopal–Itarsi Rail Doubling (Section B)', 'Railways', 'Madhya Pradesh', 'Eastern Rail Infra Pvt. Ltd.',
    920, 918, '2023-01-01', 48, '2027-01-01',
    71, 69, 22,
    'On track with minor legacy delay fully contained',
    'No intervention needed — maintain standard fortnightly telemetry and milestone logging.',
    0
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_rw8802;

  -- 4. PW-3341
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'PW-3341', 'Rewa Solar-Grid 400kV Transmission Line', 'Power', 'Madhya Pradesh', 'Vindhya Powergrid Ltd.',
    214, 249, '2025-03-01', 18, '2026-09-01',
    40, 26, 74,
    'Right-of-way disputes across 14 tower locations + transformer delivery lag',
    'Coordinate with District Collector office on ROW clearance; review contractor''s OEM vendor letter of credit.',
    11
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_pw3341;

  -- 5. NH-5510
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'NH-5510', 'Jabalpur Outer Ring Road Phase II', 'Roads', 'Madhya Pradesh', 'Omkar Roadways Ltd.',
    455, 461, '2024-08-01', 30, '2027-02-01',
    34, 31, 29,
    'Marginal aggregate quarrying pause during localized rain',
    'Monitor next reporting cycle; contractor has mobilized second asphalt paving train.',
    0
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_nh5510;

  -- 6. RW-9104
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'RW-9104', 'Eastern Dedicated Freight Corridor Branch Connection', 'Railways', 'Uttar Pradesh', 'Bharat Rail Consortium',
    1120, 1290, '2023-11-01', 42, '2027-05-01',
    62, 39, 83,
    'Subgrade soil failure on 12km stretch + subcontractor wage disputes',
    'Issue notice under Clause 14.2 for subgrade soil stabilization; order third-party audit of Petty Contractor disbursement.',
    8
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_rw9104;

  -- 7. BR-1402
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'BR-1402', 'Chenab Rail Viaduct Approach Piers', 'Bridges', 'Jammu & Kashmir', 'Himalayan Infra Engineering',
    780, 845, '2023-10-01', 36, '2026-10-01',
    58, 51, 58,
    'Slope protection rock bolting required prior to pier erection',
    'Deploy geological radar survey and ensure winterized concrete curing equipment is certified.',
    4
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_br1402;

  -- 8. PW-4902
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'PW-4902', 'Bikaner Ultra-Mega Solar Substation & Evacuation', 'Power', 'Rajasthan', 'Desert Sun Powergrid JV',
    520, 525, '2024-04-01', 24, '2026-04-01',
    73, 76, 31,
    'Progress ahead of target; nominal dust maintenance overhead',
    'Expedite grid interconnection synchronization protocol with state transmission utility.',
    0
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_pw4902;

  -- 9. NH-6218
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'NH-6218', 'Coastal National Highway Corridor Package 4', 'Roads', 'Maharashtra', 'Konkan Infra Concessions',
    890, 935, '2024-05-01', 36, '2027-05-01',
    44, 39, 49,
    'CRZ stage-II environmental clearance conditional stipulations',
    'Track compliance with Ministry of Environment, Forest and Climate Change monitoring committee.',
    1
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_nh6218;

  -- 10. RW-7319
  INSERT INTO public.projects (
    code, name, sector, location, contractor,
    cost_original, cost_revised, start_date, duration_months, target_date,
    planned_progress, actual_progress, risk_score, reason, recommendation, days_flagged
  ) VALUES (
    'RW-7319', 'Mumbai–Ahmedabad HSR Pier Substructure (Package C2)', 'Railways', 'Gujarat', 'Apex Bullet Infra Ltd.',
    1650, 1840, '2023-09-01', 40, '2027-01-01',
    65, 44, 78,
    'Precast girder casting rejection rate exceeding tolerance threshold',
    'Summon QA/QC inspection team; halt pier cap mounting until batch test certificates re-verified by IIT Roorkee.',
    9
  ) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name, cost_revised = EXCLUDED.cost_revised, actual_progress = EXCLUDED.actual_progress, risk_score = EXCLUDED.risk_score
  RETURNING id INTO v_rw7319;

  -- Clean and re-seed related items for the projects to prevent duplicates on multiple runs
  DELETE FROM public.risk_trend WHERE project_id IN (v_nh4471, v_br2209, v_rw8802, v_pw3341, v_nh5510, v_rw9104, v_br1402, v_pw4902, v_nh6218, v_rw7319);
  DELETE FROM public.risk_factors WHERE project_id IN (v_nh4471, v_br2209, v_rw8802, v_pw3341, v_nh5510, v_rw9104, v_br1402, v_pw4902, v_nh6218, v_rw7319);
  DELETE FROM public.billing_entries WHERE project_id IN (v_nh4471, v_br2209, v_rw8802, v_pw3341, v_nh5510, v_rw9104, v_br1402, v_pw4902, v_nh6218, v_rw7319);

  -- Risk Trends (6-month history: Apr, May, Jun, Jul, Aug, Sep)
  INSERT INTO public.risk_trend (project_id, month_label, risk_value, recorded_at) VALUES
    (v_nh4471, 'Apr', 38, '2026-04-01'), (v_nh4471, 'May', 44, '2026-05-01'), (v_nh4471, 'Jun', 51, '2026-06-01'),
    (v_nh4471, 'Jul', 63, '2026-07-01'), (v_nh4471, 'Aug', 78, '2026-08-01'), (v_nh4471, 'Sep', 87, '2026-09-01'),
    
    (v_br2209, 'Apr', 30, '2026-04-01'), (v_br2209, 'May', 34, '2026-05-01'), (v_br2209, 'Jun', 41, '2026-06-01'),
    (v_br2209, 'Jul', 48, '2026-07-01'), (v_br2209, 'Aug', 55, '2026-08-01'), (v_br2209, 'Sep', 61, '2026-09-01'),

    (v_rw8802, 'Apr', 24, '2026-04-01'), (v_rw8802, 'May', 22, '2026-05-01'), (v_rw8802, 'Jun', 20, '2026-06-01'),
    (v_rw8802, 'Jul', 21, '2026-07-01'), (v_rw8802, 'Aug', 23, '2026-08-01'), (v_rw8802, 'Sep', 22, '2026-09-01'),

    (v_pw3341, 'Apr', 33, '2026-04-01'), (v_pw3341, 'May', 41, '2026-05-01'), (v_pw3341, 'Jun', 48, '2026-06-01'),
    (v_pw3341, 'Jul', 58, '2026-07-01'), (v_pw3341, 'Aug', 68, '2026-08-01'), (v_pw3341, 'Sep', 74, '2026-09-01'),

    (v_nh5510, 'Apr', 18, '2026-04-01'), (v_nh5510, 'May', 20, '2026-05-01'), (v_nh5510, 'Jun', 24, '2026-06-01'),
    (v_nh5510, 'Jul', 26, '2026-07-01'), (v_nh5510, 'Aug', 28, '2026-08-01'), (v_nh5510, 'Sep', 29, '2026-09-01'),

    (v_rw9104, 'Apr', 54, '2026-04-01'), (v_rw9104, 'May', 61, '2026-05-01'), (v_rw9104, 'Jun', 67, '2026-06-01'),
    (v_rw9104, 'Jul', 74, '2026-07-01'), (v_rw9104, 'Aug', 79, '2026-08-01'), (v_rw9104, 'Sep', 83, '2026-09-01'),

    (v_br1402, 'Apr', 42, '2026-04-01'), (v_br1402, 'May', 46, '2026-05-01'), (v_br1402, 'Jun', 49, '2026-06-01'),
    (v_br1402, 'Jul', 52, '2026-07-01'), (v_br1402, 'Aug', 55, '2026-08-01'), (v_br1402, 'Sep', 58, '2026-09-01'),

    (v_pw4902, 'Apr', 29, '2026-04-01'), (v_pw4902, 'May', 31, '2026-05-01'), (v_pw4902, 'Jun', 30, '2026-06-01'),
    (v_pw4902, 'Jul', 32, '2026-07-01'), (v_pw4902, 'Aug', 30, '2026-08-01'), (v_pw4902, 'Sep', 31, '2026-09-01'),

    (v_nh6218, 'Apr', 35, '2026-04-01'), (v_nh6218, 'May', 38, '2026-05-01'), (v_nh6218, 'Jun', 42, '2026-06-01'),
    (v_nh6218, 'Jul', 45, '2026-07-01'), (v_nh6218, 'Aug', 47, '2026-08-01'), (v_nh6218, 'Sep', 49, '2026-09-01'),

    (v_rw7319, 'Apr', 48, '2026-04-01'), (v_rw7319, 'May', 54, '2026-05-01'), (v_rw7319, 'Jun', 62, '2026-06-01'),
    (v_rw7319, 'Jul', 69, '2026-07-01'), (v_rw7319, 'Aug', 73, '2026-08-01'), (v_rw7319, 'Sep', 78, '2026-09-01');

  -- Risk Factors
  INSERT INTO public.risk_factors (project_id, factor_text, weight) VALUES
    (v_nh4471, 'Expenditure ahead of progress', 34),
    (v_nh4471, 'Milestone delays (3)', 27),
    (v_nh4471, 'Material supply gap', 21),
    (v_nh4471, 'Land clearance pending', 18),

    (v_br2209, 'Monsoon work stoppage', 40),
    (v_br2209, 'Substructure foundation delay', 25),
    (v_br2209, 'Girder design revision', 20),
    (v_br2209, 'Labour shortage', 15),

    (v_rw8802, 'Minor signal cable shifting (resolved)', 60),
    (v_rw8802, 'Ballast quarry delivery logistics', 40),

    (v_pw3341, 'Right-of-way crop compensation disputes', 38),
    (v_pw3341, 'Substation transformer delivery delay', 32),
    (v_pw3341, 'Contractor liquidity constraints', 30),

    (v_nh5510, 'Slight aggregate supply lag', 55),
    (v_nh5510, 'Minor monsoon rainfall', 45),

    (v_rw9104, 'Earthwork embankment settlement issues', 41),
    (v_rw9104, 'Petty contractor payment bottlenecks', 31),
    (v_rw9104, 'Railway safety clearance backlog', 28),

    (v_br1402, 'Geological slope instability', 48),
    (v_br1402, 'Winter weather transport restrictions', 32),
    (v_br1402, 'Specialized steel delivery timeline', 20),

    (v_pw4902, 'Dust storm transmission line cleaning', 65),
    (v_pw4902, 'Remote site workforce turnaround', 35),

    (v_nh6218, 'Coastal Regulation Zone environmental approvals', 42),
    (v_nh6218, 'Mangrove buffer afforestation compliance', 33),
    (v_nh6218, 'High tide causeway scheduling', 25),

    (v_rw7319, 'High-grade precast girder batching defect rate', 39),
    (v_rw7319, 'Underground utility relocation near urban junction', 33),
    (v_rw7319, 'Material import currency fluctuation impact', 28);

  -- Billing Entries
  INSERT INTO public.billing_entries (project_id, bill_code, claimed_amount, expected_amount, status) VALUES
    (v_nh4471, 'RA-14', 42.0, 31.5, 'flagged'),
    (v_nh4471, 'RA-13', 28.0, 27.2, 'approved'),
    (v_nh4471, 'RA-12', 33.5, 32.8, 'approved'),

    (v_br2209, 'RA-09', 19.4, 18.9, 'approved'),
    (v_br2209, 'RA-08', 22.0, 21.6, 'approved'),

    (v_rw8802, 'RA-22', 55.0, 54.6, 'approved'),
    (v_rw8802, 'RA-21', 48.2, 47.9, 'approved'),

    (v_pw3341, 'RA-06', 21.2, 15.8, 'flagged'),
    (v_pw3341, 'RA-05', 16.4, 16.1, 'approved'),

    (v_nh5510, 'RA-04', 12.0, 11.7, 'approved'),
    (v_nh5510, 'RA-03', 14.8, 14.5, 'approved'),

    (v_rw9104, 'RA-19', 64.5, 48.2, 'flagged'),
    (v_rw9104, 'RA-18', 51.0, 49.5, 'approved'),

    (v_br1402, 'RA-11', 34.0, 33.1, 'approved'),
    (v_br1402, 'RA-10', 29.5, 28.9, 'approved'),

    (v_pw4902, 'RA-08', 44.5, 44.1, 'approved'),
    (v_pw4902, 'RA-07', 39.0, 38.6, 'approved'),

    (v_nh6218, 'RA-05', 31.0, 30.2, 'approved'),
    (v_nh6218, 'RA-04', 26.5, 26.0, 'approved'),

    (v_rw7319, 'RA-15', 88.0, 69.4, 'flagged'),
    (v_rw7319, 'RA-14', 72.0, 70.8, 'approved');

  -- Initial Daily Entries
  INSERT INTO public.daily_entries (
    project_id, entry_date, work_status, delay_reason, material_notes, photo_url, notes, reviewed_status
  ) VALUES
    (
      v_nh4471, '2026-09-11', 'Running', NULL,
      'Cement: 120 bags · Steel: 42 MT', 'geo_chainage_42_pier12.jpg',
      'Girder casting for Pier 12 completed. Slump test: 110mm.', 'Pending Review'
    ),
    (
      v_br2209, '2026-09-10', 'Running', NULL,
      'Cement: 90 bags · Sand: 28 cum', 'narmada_abutment_a2.jpg',
      'Abutment A2 shuttering work inspected and cleared for concrete pour.', 'Reviewed'
    ),
    (
      v_nh4471, '2026-09-09', 'Stalled', 'Land/legal dispute',
      'None logged', 'row_dispute_km44.jpg',
      'Right-of-way dispute at km 44. Local revenue authority team visited.', 'Reviewed'
    ),
    (
      v_br2209, '2026-09-08', 'Off', 'Weather',
      'None logged', NULL,
      'River water level exceeded safety limit (Gauge 3.4m). Operations halted.', 'Reviewed'
    );

END $$;
