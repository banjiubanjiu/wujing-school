PRAGMA foreign_keys=ON;

-- 基础角色与组织
INSERT OR IGNORE INTO roles (code, name) VALUES
  ('ADMIN', '教务管理员'),
  ('TEACHER', '教师'),
  ('STUDENT', '学员');

INSERT OR IGNORE INTO org_units (name, type, parent_id) VALUES
  ('警官学院', 'ACADEMY', NULL);

INSERT OR IGNORE INTO org_units (name, type, parent_id)
VALUES
  ('第一大队', 'BATTALION', (SELECT id FROM org_units WHERE name = '警官学院')),
  ('第二大队', 'BATTALION', (SELECT id FROM org_units WHERE name = '警官学院')),
  ('第三大队', 'BATTALION', (SELECT id FROM org_units WHERE name = '警官学院'));

-- 学期
INSERT OR IGNORE INTO terms (name, start_date, end_date, is_current) VALUES
  ('2024-2025-1', '2024-09-01', '2025-01-15', 1),
  ('2024-2025-2', '2025-03-01', '2025-07-10', 0),
  ('2025-2026-1', '2025-09-01', '2026-01-10', 0),
  ('2025-2026-2', '2026-03-01', '2026-07-10', 0),
  ('2023-2024-2', '2024-03-01', '2024-07-10', 0);

-- 教室/场地
DELETE FROM rooms;
INSERT INTO rooms (code, name, building, room_type, capacity, active) VALUES
  ('MAIN-201', '综合楼201', '教学主楼', '教室', 80, 1),
  ('MAIN-303', '综合楼303', '教学主楼', '教室', 80, 1),
  ('MAIN-301', '主楼301', '教学主楼', '教室', 80, 1),
  ('COURT', '模拟法庭', '教学主楼', '实训', 60, 1),
  ('SEC-LAB-A', '网安实验室A', '信息中心', '实验室', 40, 1),
  ('SEC-LAB-B', '网安实验室B', '信息中心', '实验室', 40, 1),
  ('INNO-SEC', '网安创新中心', '信息中心', '实验室', 50, 1),
  ('FIELD-A', '操场A区', '训练场', '场地', NULL, 1),
  ('TRA-SAND', '交通沙盘室', '训练楼', '实训', 50, 1),
  ('TRA-SCENE', '交管情景室', '训练楼', '情景', 40, 1),
  ('ACCIDENT', '事故演练场', '训练场', '场地', NULL, 1),
  ('CSI-LAB', '刑侦实验室', '刑侦楼', '实验室', 40, 1),
  ('CASE-ROOM', '案例研讨室', '教学楼', '研讨', 40, 1),
  ('REDBLUE', '红蓝靶场', '训练场', '靶场', NULL, 1),
  ('VEHICLE', '车辆实验室', '训练楼', '实验室', 30, 1);

-- 专业
INSERT OR IGNORE INTO majors (code, name, org_unit_id, level, degree, duration_years, active, description) VALUES
  ('INV', '刑事侦查学', (SELECT id FROM org_units WHERE name = '第二大队'), '本科', '法学', 4, 1, '重侦查、勘查、证据链'),
  ('CYBER', '网络安全', (SELECT id FROM org_units WHERE name = '第三大队'), '本科', '工学', 4, 1, '攻防对抗与取证'),
  ('TRAFFIC', '交通管理', (SELECT id FROM org_units WHERE name = '第一大队'), '本科', '工学', 4, 1, '道路安全与事故处理');

-- 班级
INSERT OR IGNORE INTO classes (code, name, major_id, term_id, grade_year, advisor_name) VALUES
  ('INV2024A', '2024刑侦一队', (SELECT id FROM majors WHERE code = 'INV'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '王教官'),
  ('INV2024B', '2024刑侦二队', (SELECT id FROM majors WHERE code = 'INV'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '李教官'),
  ('CYB2024A', '2024网安一队', (SELECT id FROM majors WHERE code = 'CYBER'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '周教官'),
  ('CYB2024B', '2024网安二队', (SELECT id FROM majors WHERE code = 'CYBER'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '钱教官'),
  ('TRA2024A', '2024交管一队', (SELECT id FROM majors WHERE code = 'TRAFFIC'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '赵教官'),
  ('TRA2024B', '2024交管二队', (SELECT id FROM majors WHERE code = 'TRAFFIC'), (SELECT id FROM terms WHERE name = '2024-2025-1'), 2024, '孙教官'),
  ('INV2025A', '2025刑侦一队', (SELECT id FROM majors WHERE code = 'INV'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '贾教官'),
  ('INV2025B', '2025刑侦二队', (SELECT id FROM majors WHERE code = 'INV'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '马教官'),
  ('CYB2025A', '2025网安一队', (SELECT id FROM majors WHERE code = 'CYBER'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '易教官'),
  ('CYB2025B', '2025网安二队', (SELECT id FROM majors WHERE code = 'CYBER'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '任教官'),
  ('TRA2025A', '2025交管一队', (SELECT id FROM majors WHERE code = 'TRAFFIC'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '吴教官'),
  ('TRA2025B', '2025交管二队', (SELECT id FROM majors WHERE code = 'TRAFFIC'), (SELECT id FROM terms WHERE name = '2025-2026-1'), 2025, '郑教官');

-- 教师账号
INSERT OR IGNORE INTO users (username, password_hash, full_name, email, org_unit_id, active) VALUES
  ('teacher_inv1', 'teacher123', '陈队', 'teacher_inv1@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('teacher_inv2', 'teacher123', '杜队', 'teacher_inv2@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('teacher_cyb1', 'teacher123', '赵博士', 'teacher_cyb1@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('teacher_cyb2', 'teacher123', '钱博士', 'teacher_cyb2@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('teacher_tra1', 'teacher123', '孙教练', 'teacher_tra1@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('teacher_tra2', 'teacher123', '周教练', 'teacher_tra2@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1);

INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_inv1' AND r.code = 'TEACHER';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_inv2' AND r.code = 'TEACHER';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_cyb1' AND r.code = 'TEACHER';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_cyb2' AND r.code = 'TEACHER';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_tra1' AND r.code = 'TEACHER';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'teacher_tra2' AND r.code = 'TEACHER';

INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '讲师' FROM users u, majors m WHERE u.username = 'teacher_inv1' AND m.code = 'INV';
INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '副教授' FROM users u, majors m WHERE u.username = 'teacher_inv2' AND m.code = 'INV';
INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '讲师' FROM users u, majors m WHERE u.username = 'teacher_cyb1' AND m.code = 'CYBER';
INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '讲师' FROM users u, majors m WHERE u.username = 'teacher_cyb2' AND m.code = 'CYBER';
INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '讲师' FROM users u, majors m WHERE u.username = 'teacher_tra1' AND m.code = 'TRAFFIC';
INSERT OR IGNORE INTO teachers (user_id, major_id, title)
SELECT u.id, m.id, '讲师' FROM users u, majors m WHERE u.username = 'teacher_tra2' AND m.code = 'TRAFFIC';

-- 学员账号
INSERT OR IGNORE INTO users (username, password_hash, full_name, email, org_unit_id, active) VALUES
  ('inv24a01', 'student123', '张晨', 'inv24a01@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv24a02', 'student123', '李勇', 'inv24a02@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv24b01', 'student123', '王哲', 'inv24b01@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv24b02', 'student123', '赵洁', 'inv24b02@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('cyb24a01', 'student123', '周一凡', 'cyb24a01@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb24a02', 'student123', '钱若溪', 'cyb24a02@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb24b01', 'student123', '孙宇', 'cyb24b01@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb24b02', 'student123', '吴双', 'cyb24b02@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('tra24a01', 'student123', '郑宁', 'tra24a01@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra24a02', 'student123', '许佳', 'tra24a02@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra24b01', 'student123', '鲁昊', 'tra24b01@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra24b02', 'student123', '何琪', 'tra24b02@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('inv25a01', 'student123', '徐成', 'inv25a01@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv25a02', 'student123', '韩锐', 'inv25a02@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv25b01', 'student123', '吕欣', 'inv25b01@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('inv25b02', 'student123', '龚琪', 'inv25b02@academy.local', (SELECT id FROM org_units WHERE name = '第二大队'), 1),
  ('cyb25a01', 'student123', '谭琛', 'cyb25a01@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb25a02', 'student123', '文静', 'cyb25a02@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb25b01', 'student123', '黎安', 'cyb25b01@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('cyb25b02', 'student123', '蒋川', 'cyb25b02@academy.local', (SELECT id FROM org_units WHERE name = '第三大队'), 1),
  ('tra25a01', 'student123', '唐萌', 'tra25a01@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra25a02', 'student123', '裴林', 'tra25a02@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra25b01', 'student123', '蒙嘉', 'tra25b01@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1),
  ('tra25b02', 'student123', '谢云', 'tra25b02@academy.local', (SELECT id FROM org_units WHERE name = '第一大队'), 1);

INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'inv24a01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'inv24a02' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'inv24b01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'inv24b02' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'cyb24a01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'cyb24a02' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'cyb24b01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'cyb24b02' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'tra24a01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'tra24a02' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'tra24b01' AND r.code = 'STUDENT';
INSERT OR IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'tra24b02' AND r.code = 'STUDENT';

INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV24001', 'active' FROM users u, classes c WHERE u.username = 'inv24a01' AND c.code = 'INV2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV24002', 'active' FROM users u, classes c WHERE u.username = 'inv24a02' AND c.code = 'INV2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV24B01', 'active' FROM users u, classes c WHERE u.username = 'inv24b01' AND c.code = 'INV2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV24B02', 'leave' FROM users u, classes c WHERE u.username = 'inv24b02' AND c.code = 'INV2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB24001', 'active' FROM users u, classes c WHERE u.username = 'cyb24a01' AND c.code = 'CYB2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB24002', 'active' FROM users u, classes c WHERE u.username = 'cyb24a02' AND c.code = 'CYB2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB24B01', 'active' FROM users u, classes c WHERE u.username = 'cyb24b01' AND c.code = 'CYB2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB24B02', 'active' FROM users u, classes c WHERE u.username = 'cyb24b02' AND c.code = 'CYB2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA24001', 'active' FROM users u, classes c WHERE u.username = 'tra24a01' AND c.code = 'TRA2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA24002', 'active' FROM users u, classes c WHERE u.username = 'tra24a02' AND c.code = 'TRA2024A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA24B01', 'active' FROM users u, classes c WHERE u.username = 'tra24b01' AND c.code = 'TRA2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA24B02', 'leave' FROM users u, classes c WHERE u.username = 'tra24b02' AND c.code = 'TRA2024B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV25001', 'active' FROM users u, classes c WHERE u.username = 'inv25a01' AND c.code = 'INV2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV25002', 'active' FROM users u, classes c WHERE u.username = 'inv25a02' AND c.code = 'INV2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV25B01', 'active' FROM users u, classes c WHERE u.username = 'inv25b01' AND c.code = 'INV2025B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'INV25B02', 'leave' FROM users u, classes c WHERE u.username = 'inv25b02' AND c.code = 'INV2025B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB25001', 'active' FROM users u, classes c WHERE u.username = 'cyb25a01' AND c.code = 'CYB2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB25002', 'active' FROM users u, classes c WHERE u.username = 'cyb25a02' AND c.code = 'CYB2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB25B01', 'active' FROM users u, classes c WHERE u.username = 'cyb25b01' AND c.code = 'CYB2025B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'CYB25B02', 'active' FROM users u, classes c WHERE u.username = 'cyb25b02' AND c.code = 'CYB2025B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA25001', 'active' FROM users u, classes c WHERE u.username = 'tra25a01' AND c.code = 'TRA2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA25002', 'active' FROM users u, classes c WHERE u.username = 'tra25a02' AND c.code = 'TRA2025A';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA25B01', 'active' FROM users u, classes c WHERE u.username = 'tra25b01' AND c.code = 'TRA2025B';
INSERT OR IGNORE INTO students (user_id, class_id, student_no, status)
SELECT u.id, c.id, 'TRA25B02', 'leave' FROM users u, classes c WHERE u.username = 'tra25b02' AND c.code = 'TRA2025B';

-- 课程
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV101', '刑侦基础', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv1') AND tr.name = '2024-2025-1' AND c.code = 'INV2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV101');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV102', '侦查取证', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv2') AND tr.name = '2024-2025-1' AND c.code = 'INV2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV102');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV201', '现场勘查', m.id, t.id, tr.id, c.id, '必修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv1') AND tr.name = '2024-2025-2' AND c.code = 'INV2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV201');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV202', '刑事心理', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 2
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv2') AND tr.name = '2024-2025-2' AND c.code = 'INV2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV202');

INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB101', '网络安全基础', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb1') AND tr.name = '2024-2025-1' AND c.code = 'CYB2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB101');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB102', '数字取证', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb2') AND tr.name = '2024-2025-1' AND c.code = 'CYB2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB102');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB201', '渗透测试', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb2') AND tr.name = '2024-2025-2' AND c.code = 'CYB2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB201');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB202', '恶意代码分析', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb1') AND tr.name = '2024-2025-2' AND c.code = 'CYB2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB202');

INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA101', '交通管理法规', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra1') AND tr.name = '2024-2025-1' AND c.code = 'TRA2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA101');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA102', '事故勘查', m.id, t.id, tr.id, c.id, '必修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra2') AND tr.name = '2024-2025-1' AND c.code = 'TRA2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA102');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA201', '道路指挥实务', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 2
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra2') AND tr.name = '2024-2025-2' AND c.code = 'TRA2024A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA201');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA202', '车辆识别与检查', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra1') AND tr.name = '2024-2025-2' AND c.code = 'TRA2024B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA202');

-- 2025 级课程（更多数据量）
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV301', '刑侦技术', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv1') AND tr.name = '2025-2026-1' AND c.code = 'INV2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV301');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV302', '侦查案例研讨', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 2
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv2') AND tr.name = '2025-2026-1' AND c.code = 'INV2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV302');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV401', '刑侦综合演练', m.id, t.id, tr.id, c.id, '实践', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv1') AND tr.name = '2025-2026-2' AND c.code = 'INV2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV401');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'INV402', '证据综合实务', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'INV' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_inv2') AND tr.name = '2025-2026-2' AND c.code = 'INV2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'INV402');

INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB301', '安全架构设计', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb1') AND tr.name = '2025-2026-1' AND c.code = 'CYB2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB301');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB302', '零信任实践', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb2') AND tr.name = '2025-2026-1' AND c.code = 'CYB2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB302');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB401', '红蓝对抗', m.id, t.id, tr.id, c.id, '实践', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb1') AND tr.name = '2025-2026-2' AND c.code = 'CYB2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB401');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'CYB402', '威胁情报分析', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'CYBER' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_cyb2') AND tr.name = '2025-2026-2' AND c.code = 'CYB2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CYB402');

INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA301', '道路运输监管', m.id, t.id, tr.id, c.id, '必修', 1, 3.0, 4
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra1') AND tr.name = '2025-2026-1' AND c.code = 'TRA2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA301');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA302', '事故调查实验', m.id, t.id, tr.id, c.id, '选修', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra2') AND tr.name = '2025-2026-1' AND c.code = 'TRA2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA302');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA401', '交通应急指挥', m.id, t.id, tr.id, c.id, '实践', 1, 2.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra1') AND tr.name = '2025-2026-2' AND c.code = 'TRA2025A'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA401');
INSERT INTO courses (code, name, major_id, teacher_id, term_id, class_id, course_type, active, credit, weekly_hours)
SELECT 'TRA402', '车辆动力学', m.id, t.id, tr.id, c.id, '选修', 1, 3.0, 3
FROM majors m, teachers t, terms tr, classes c
WHERE m.code = 'TRAFFIC' AND t.user_id = (SELECT id FROM users WHERE username = 'teacher_tra2') AND tr.name = '2025-2026-2' AND c.code = 'TRA2025B'
  AND NOT EXISTS (SELECT 1 FROM courses WHERE code = 'TRA402');

-- 课表
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 1, 1, 2, '综合楼201'
FROM courses c WHERE c.code = 'INV101'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 1 AND start_slot = 1);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 3, 3, 4, '模拟法庭'
FROM courses c WHERE c.code = 'INV102'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 3 AND start_slot = 3);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 2, 1, 2, '网安实验室A'
FROM courses c WHERE c.code = 'CYB101'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 2 AND start_slot = 1);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 4, 5, 6, '网安实验室B'
FROM courses c WHERE c.code = 'CYB202'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 4 AND start_slot = 5);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 1, 3, 4, '交通沙盘室'
FROM courses c WHERE c.code = 'TRA101'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 1 AND start_slot = 3);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 5, 1, 2, '事故演练场'
FROM courses c WHERE c.code = 'TRA201'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 5 AND start_slot = 1);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 2, 3, 4, '刑侦实验室'
FROM courses c WHERE c.code = 'INV301'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 2 AND start_slot = 3);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 4, 1, 2, '案例研讨室'
FROM courses c WHERE c.code = 'INV302'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 4 AND start_slot = 1);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 1, 5, 6, '网安创新中心'
FROM courses c WHERE c.code = 'CYB301'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 1 AND start_slot = 5);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 3, 1, 2, '红蓝靶场'
FROM courses c WHERE c.code = 'CYB401'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 3 AND start_slot = 1);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 2, 5, 6, '交管情景室'
FROM courses c WHERE c.code = 'TRA301'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 2 AND start_slot = 5);
INSERT INTO schedule_entries (course_id, class_id, teacher_id, weekday, start_slot, end_slot, location)
SELECT c.id, c.class_id, c.teacher_id, 4, 3, 4, '车辆实验室'
FROM courses c WHERE c.code = 'TRA402'
  AND NOT EXISTS (SELECT 1 FROM schedule_entries WHERE course_id = c.id AND weekday = 4 AND start_slot = 3);

-- 考试
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2025-01-08', '09:00', 120, '综合楼201', '教务处'
FROM courses c WHERE c.code = 'INV101'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2025-01-10', '14:00', 120, '网安实验室A', '信息中心'
FROM courses c WHERE c.code = 'CYB101'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2025-01-12', '09:00', 90, '主楼301', '交管系'
FROM courses c WHERE c.code = 'TRA101'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-05', '09:00', 120, '综合楼303', '刑侦系'
FROM courses c WHERE c.code = 'INV301'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-06', '14:00', 90, '案例研讨室', '刑侦系'
FROM courses c WHERE c.code = 'INV302'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-07', '09:00', 120, '网安创新中心', '信息中心'
FROM courses c WHERE c.code = 'CYB301'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-08', '14:00', 120, '红蓝靶场', '信息中心'
FROM courses c WHERE c.code = 'CYB401'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-09', '09:00', 90, '交管情景室', '交管系'
FROM courses c WHERE c.code = 'TRA301'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);
INSERT INTO exams (course_id, class_id, term_id, exam_type, exam_date, start_time, duration_minutes, location, invigilators)
SELECT c.id, c.class_id, c.term_id, '期末', '2026-01-10', '14:00', 120, '车辆实验室', '交管系'
FROM courses c WHERE c.code = 'TRA402'
  AND NOT EXISTS (SELECT 1 FROM exams e WHERE e.course_id = c.id);

-- 成绩（去重：同一学生+课程只插一次）
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status, reviewer)
SELECT s.id, c.id, c.term_id, 85, 88, 87, 'published', '教学办'
FROM students s, courses c
WHERE s.student_no = 'INV24001' AND c.code = 'INV101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status, reviewer)
SELECT s.id, c.id, c.term_id, 78, 82, 80, 'submitted', '教学办'
FROM students s, courses c
WHERE s.student_no = 'INV24002' AND c.code = 'INV101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 81, 75, 78, 'draft'
FROM students s, courses c
WHERE s.student_no = 'CYB24001' AND c.code = 'CYB101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 92, 90, 91, 'submitted'
FROM students s, courses c
WHERE s.student_no = 'CYB24002' AND c.code = 'CYB101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 70, 78, 75, 'draft'
FROM students s, courses c
WHERE s.student_no = 'TRA24001' AND c.code = 'TRA101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 88, 92, 90, 'published'
FROM students s, courses c
WHERE s.student_no = 'TRA24002' AND c.code = 'TRA101'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 82, 85, 84, 'submitted'
FROM students s, courses c
WHERE s.student_no = 'INV25001' AND c.code = 'INV301'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 74, 79, 77, 'draft'
FROM students s, courses c
WHERE s.student_no = 'INV25002' AND c.code = 'INV302'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 90, 93, 92, 'submitted'
FROM students s, courses c
WHERE s.student_no = 'CYB25001' AND c.code = 'CYB301'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 68, 70, 69, 'draft'
FROM students s, courses c
WHERE s.student_no = 'CYB25B02' AND c.code = 'CYB402'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 83, 86, 85, 'submitted'
FROM students s, courses c
WHERE s.student_no = 'TRA25001' AND c.code = 'TRA301'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
INSERT INTO grades (student_id, course_id, term_id, usual_score, final_score, total_score, status)
SELECT s.id, c.id, c.term_id, 71, 78, 75, 'draft'
FROM students s, courses c
WHERE s.student_no = 'TRA25B02' AND c.code = 'TRA402'
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.student_id = s.id AND g.course_id = c.id);
