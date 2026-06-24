"""
TrackFlow â€” MySQL â†’ MongoDB Data Migration Script
===================================================
Requirements: pip install pymysql pymongo

Usage:
    python migrate_mysql_to_mongo.py

What it does:
  1. Reads all tables from MySQL `trackflow` database
  2. Applies embed strategy:
       - user_settings   â†’ embedded in users as 'settings'
       - project_members â†’ embedded in projects as 'members'
       - comments        â†’ embedded in tasks as 'comments'
       - attachments     â†’ embedded in tasks as 'attachments'
  3. Converts all FK columns to String IDs
  4. Drops and recreates MongoDB 'trackflow' database (clean migration)
  5. Inserts all documents

MySQL IDs (Long) are preserved as strings e.g. id=5 â†’ _id="5"
"""

import pymysql
import pymongo
from datetime import datetime, date

# â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MYSQL_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "Kk1234@",
    "database": "trackflow",
    "cursorclass": pymysql.cursors.DictCursor,
    "charset": "utf8mb4",
}

MONGO_URI = "mongodb://localhost:27017"
MONGO_DB  = "trackflow"

# â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def sid(val):
    """Convert a MySQL numeric id / FK to string, or None."""
    return str(val) if val is not None else None

def serialize(obj):
    """Convert Python date/datetime to ISO string for MongoDB."""
    if isinstance(obj, datetime):
        return obj
    if isinstance(obj, date):
        return obj.isoformat()
    return obj

def clean(row: dict) -> dict:
    """Serialize all values in a MySQL result row."""
    return {k: serialize(v) for k, v in row.items()}

def fetch_all(cursor, table: str) -> list[dict]:
    cursor.execute(f"SELECT * FROM `{table}`")
    return [clean(r) for r in cursor.fetchall()]

# â”€â”€â”€ Main Migration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def main():
    print("=== TrackFlow MySQL -> MongoDB Migration ===\n")

    # Connect
    mysql_conn = pymysql.connect(**MYSQL_CONFIG)
    mongo_client = pymongo.MongoClient(MONGO_URI)

    try:
        with mysql_conn.cursor() as cur:

            # â”€â”€ 0. Drop target DB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print(f"Dropping MongoDB database '{MONGO_DB}'...")
            mongo_client.drop_database(MONGO_DB)
            db = mongo_client[MONGO_DB]
            print("Done.\n")

            # â”€â”€ 1. Load all tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Reading MySQL tables...")
            users_rows        = fetch_all(cur, "users")
            user_settings_rows= fetch_all(cur, "user_settings")
            workspaces_rows   = fetch_all(cur, "workspaces")
            projects_rows     = fetch_all(cur, "projects")
            proj_members_rows = fetch_all(cur, "project_members")
            sprints_rows      = fetch_all(cur, "sprints")
            tasks_rows        = fetch_all(cur, "tasks")
            comments_rows     = fetch_all(cur, "comments")
            attachments_rows  = fetch_all(cur, "attachments")
            milestones_rows   = fetch_all(cur, "milestones")
            notif_rows        = fetch_all(cur, "notifications")
            activity_rows     = fetch_all(cur, "activity_logs")
            print(f"  users={len(users_rows)}, workspaces={len(workspaces_rows)}, "
                  f"projects={len(projects_rows)}, tasks={len(tasks_rows)}, "
                  f"sprints={len(sprints_rows)}, milestones={len(milestones_rows)}, "
                  f"notifications={len(notif_rows)}, activity_logs={len(activity_rows)}\n")

            # â”€â”€ 2. Build lookup maps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            # user_settings keyed by user_id
            settings_by_user = {str(r["user_id"]): r for r in user_settings_rows}

            # project_members grouped by project_id
            members_by_project: dict[str, list] = {}
            for pm in proj_members_rows:
                pid = str(pm["project_id"])
                members_by_project.setdefault(pid, []).append(pm)

            # comments grouped by task_id
            comments_by_task: dict[str, list] = {}
            for c in comments_rows:
                tid = str(c["task_id"])
                comments_by_task.setdefault(tid, []).append(c)

            # attachments grouped by task_id
            attachments_by_task: dict[str, list] = {}
            for a in attachments_rows:
                tid = str(a["task_id"])
                attachments_by_task.setdefault(tid, []).append(a)

            # workspace â†’ owner_id map (for denormalizing ownerId into Project)
            owner_by_workspace = {str(w["id"]): str(w["owner_id"]) for w in workspaces_rows}

            # project â†’ owner_id map (for denormalizing ownerId into Task)
            owner_by_project = {}

            # â”€â”€ 3. Migrate USERS (with embedded settings) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating users...")
            user_docs = []
            for u in users_rows:
                uid = str(u["id"])
                s = settings_by_user.get(uid, {})
                doc = {
                    "_id": uid,
                    "name": u["name"],
                    "email": u["email"],
                    "passwordHash": u["password_hash"],
                    "role": u.get("role", "USER"),
                    "createdAt": u.get("created_at"),
                    "avatarUrl": u.get("avatar_url"),
                    "jobTitle": u.get("job_title"),
                    "bio": u.get("bio"),
                    "location": u.get("location"),
                    "githubUrl": u.get("github_url"),
                    "linkedinUrl": u.get("linkedin_url"),
                    "twitterUrl": u.get("twitter_url"),
                    "settings": {
                        "theme": s.get("theme", "system"),
                        "language": s.get("language", "en"),
                        "timezone": s.get("timezone", "UTC"),
                        "currentFocus": s.get("current_focus"),
                        "notifTaskAssignments": bool(s.get("notif_task_assignments", True)),
                        "notifMentions": bool(s.get("notif_mentions", True)),
                        "notifProjectUpdates": bool(s.get("notif_project_updates", True)),
                        "notifMarketing": bool(s.get("notif_marketing", False)),
                    } if s else None,
                }
                user_docs.append(doc)
            if user_docs:
                db.users.insert_many(user_docs)
            print(f"  âœ“ {len(user_docs)} users inserted")

            # â”€â”€ 4. Migrate WORKSPACES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating workspaces...")
            ws_docs = []
            for w in workspaces_rows:
                doc = {
                    "_id": str(w["id"]),
                    "name": w["name"],
                    "logo": w.get("logo"),
                    "description": w.get("description"),
                    "ownerId": str(w["owner_id"]),
                    "createdAt": w.get("created_at"),
                    "updatedAt": w.get("updated_at"),
                }
                ws_docs.append(doc)
            if ws_docs:
                db.workspaces.insert_many(ws_docs)
            print(f"  âœ“ {len(ws_docs)} workspaces inserted")

            # â”€â”€ 5. Migrate PROJECTS (with embedded members) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating projects...")
            proj_docs = []
            for p in projects_rows:
                pid = str(p["id"])
                wid = str(p["workspace_id"])
                oid = owner_by_workspace.get(wid)
                owner_by_project[pid] = oid  # store for Task denorm

                raw_members = members_by_project.get(pid, [])
                embedded_members = [
                    {
                        "userId": str(m["user_id"]),
                        "projectRole": m.get("project_role", "MEMBER"),
                        "joinedAt": m.get("joined_at"),
                    }
                    for m in raw_members
                ]

                doc = {
                    "_id": pid,
                    "name": p["name"],
                    "description": p.get("description"),
                    "status": p.get("status", "ACTIVE"),
                    "startDate": p.get("start_date"),
                    "endDate": p.get("end_date"),
                    "githubRepoUrl": p.get("github_repo_url"),
                    "workspaceId": wid,
                    "ownerId": oid,           # denormalized for fast queries
                    "members": embedded_members,
                    "createdAt": p.get("created_at"),
                    "updatedAt": p.get("updated_at"),
                }
                proj_docs.append(doc)
            if proj_docs:
                db.projects.insert_many(proj_docs)
            print(f"  âœ“ {len(proj_docs)} projects inserted")

            # â”€â”€ 6. Migrate SPRINTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating sprints...")
            sprint_docs = []
            for s in sprints_rows:
                doc = {
                    "_id": str(s["id"]),
                    "name": s["name"],
                    "startDate": s.get("start_date"),
                    "endDate": s.get("end_date"),
                    "goal": s.get("goal"),
                    "projectId": str(s["project_id"]),
                    "createdAt": s.get("created_at"),
                    "updatedAt": s.get("updated_at"),
                }
                sprint_docs.append(doc)
            if sprint_docs:
                db.sprints.insert_many(sprint_docs)
            print(f"  âœ“ {len(sprint_docs)} sprints inserted")

            # â”€â”€ 7. Migrate TASKS (with embedded comments + attachments) â”€â”€â”€â”€â”€â”€â”€
            print("Migrating tasks...")
            task_docs = []
            for t in tasks_rows:
                tid = str(t["id"])
                pid = str(t["project_id"]) if t.get("project_id") else None
                oid = owner_by_project.get(pid) if pid else None

                embedded_comments = [
                    {
                        "id": str(c["id"]),
                        "content": c["content"],
                        "authorId": str(c["author_id"]),
                        "createdAt": c.get("created_at"),
                    }
                    for c in comments_by_task.get(tid, [])
                ]
                embedded_attachments = [
                    {
                        "id": str(a["id"]),
                        "fileName": a["file_name"],
                        "fileUrl": a["file_url"],
                        "uploadedById": str(a["uploaded_by"]),
                        "uploadedAt": a.get("uploaded_at"),
                    }
                    for a in attachments_by_task.get(tid, [])
                ]

                doc = {
                    "_id": tid,
                    "title": t["title"],
                    "description": t.get("description"),
                    "priority": t.get("priority", "MEDIUM"),
                    "status": t.get("status", "TODO"),
                    "dueDate": t.get("due_date"),
                    "assigneeId": sid(t.get("assignee_id")),
                    "projectId": pid,
                    "ownerId": oid,           # denormalized for dashboard queries
                    "sprintId": sid(t.get("sprint_id")),
                    "parentTaskId": sid(t.get("parent_task_id")),
                    "comments": embedded_comments,
                    "attachments": embedded_attachments,
                    "createdAt": t.get("created_at"),
                    "updatedAt": t.get("updated_at"),
                }
                task_docs.append(doc)
            if task_docs:
                db.tasks.insert_many(task_docs)
            print(f"  âœ“ {len(task_docs)} tasks inserted")

            # â”€â”€ 8. Migrate MILESTONES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating milestones...")
            milestone_docs = []
            for m in milestones_rows:
                doc = {
                    "_id": str(m["id"]),
                    "title": m["title"],
                    "description": m.get("description"),
                    "dueDate": m.get("due_date"),
                    "completed": bool(m.get("completed", False)),
                    "projectId": str(m["project_id"]),
                    "createdAt": m.get("created_at"),
                    "updatedAt": m.get("updated_at"),
                }
                milestone_docs.append(doc)
            if milestone_docs:
                db.milestones.insert_many(milestone_docs)
            print(f"  âœ“ {len(milestone_docs)} milestones inserted")

            # â”€â”€ 9. Migrate NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating notifications...")
            notif_docs = []
            for n in notif_rows:
                doc = {
                    "_id": str(n["id"]),
                    "title": n["title"],
                    "message": n["message"],
                    "readStatus": bool(n.get("read_status", False)),
                    "userId": str(n["user_id"]),
                    "createdAt": n.get("created_at"),
                }
                notif_docs.append(doc)
            if notif_docs:
                db.notifications.insert_many(notif_docs)
            print(f"  âœ“ {len(notif_docs)} notifications inserted")

            # â”€â”€ 10. Migrate ACTIVITY LOGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("Migrating activity logs...")
            activity_docs = []
            for a in activity_rows:
                doc = {
                    "_id": str(a["id"]),
                    "action": a["action"],
                    "userId": str(a["user_id"]),
                    "projectId": sid(a.get("project_id")),
                    "taskId": sid(a.get("task_id")),
                    "timestamp": a.get("timestamp"),
                }
                activity_docs.append(doc)
            if activity_docs:
                db.activity_logs.insert_many(activity_docs)
            print(f"  âœ“ {len(activity_docs)} activity logs inserted")

            # â”€â”€ 11. Create Indexes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("\nCreating MongoDB indexes...")
            db.users.create_index("email", unique=True)
            db.projects.create_index("ownerId")
            db.projects.create_index("status")
            db.tasks.create_index("projectId")
            db.tasks.create_index("ownerId")
            db.tasks.create_index("status")
            db.tasks.create_index("assigneeId")
            db.tasks.create_index([("updatedAt", pymongo.DESCENDING)])
            db.notifications.create_index("userId")
            db.activity_logs.create_index("projectId")
            db.activity_logs.create_index("taskId")
            db.milestones.create_index("projectId")
            db.sprints.create_index("projectId")
            print("  âœ“ Indexes created")

            # â”€â”€ 12. Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            print("\n=== Migration Complete ===")
            print(f"  users:          {db.users.count_documents({})}")
            print(f"  workspaces:     {db.workspaces.count_documents({})}")
            print(f"  projects:       {db.projects.count_documents({})}")
            print(f"  sprints:        {db.sprints.count_documents({})}")
            print(f"  tasks:          {db.tasks.count_documents({})}")
            print(f"  milestones:     {db.milestones.count_documents({})}")
            print(f"  notifications:  {db.notifications.count_documents({})}")
            print(f"  activity_logs:  {db.activity_logs.count_documents({})}")
            print("\nYour MySQL data is now in MongoDB. You can now start the Spring Boot app.")

    finally:
        mysql_conn.close()
        mongo_client.close()


if __name__ == "__main__":
    main()

