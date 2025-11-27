# Police Academy 教务/训练平台 (MVP)

面向武警/警校的一体化教务与训练平台。当前仓库实现了 P0（账号/角色/菜单）与 P1（课堂教学线：学籍、课程、培养方案、排课/课表、成绩）的最小可用版本，便于后续扩展。

## 目录结构
- `backend/`：FastAPI + SQLAlchemy，默认 SQLite，自带演示数据。
- `frontend/`：纯静态单页示例（调用后端 API）。
- `docs/`：需求规格、计划与技术选型。

## 快速运行
后端依赖：Python 3.11+。

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

使用其他数据库：设置 `DATABASE_URL`（见 `backend/.env.example`，支持 MySQL/PG）。

前端示例：直接用浏览器打开 `frontend/index.html`（若后端地址非 `http://localhost:8000`，修改文件顶部 `apiBase`）。

## 预置演示账号
- 教务管理员：`admin` / `admin123`
- 教师：`teacher1` / `teacher123`
- 学员：`student1` / `student123`

启动后端时会自动建表并导入上述账号及基础数据（班级、课程、培养方案、课表、成绩示例）。

## 已完成功能 (MVP)
- 账号/角色/菜单：登录、角色鉴权、按角色返回菜单与首页概览。
- 学籍：查询/创建/批量导入/导出学生，状态变更（含状态日志），班级/专业/学期/机构列表。
- 培养方案：方案与课程条目查询、创建与复制。
- 课程与课表：课程/教学班创建与查询，排课（冲突检测），学生/教师个人课表，教务按班级/教师查看课表。
- 成绩：教师录入与提交，教务审核/发布，学生查询自己的成绩（草稿/提交/驳回/发布状态）。
- 前端示例页：角色登录、首页统计、学生/教师/教务视角的展示，含学籍导入、班级/课程/培养方案/排课创建的演示表单。

## 后续建议
1) 补充 Alembic 迁移和生产数据库（MySQL/PG），替换默认 SQLite。
2) 前端补充成绩录入、学生状态变更等交互，并收敛为更贴近正式界面的流程。
3) 培养方案编辑/删除、选课流程（P3）及训练线闭环（P2），同时补充批量排课与冲突提示的优化。
