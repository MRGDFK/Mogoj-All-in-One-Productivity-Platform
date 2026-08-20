import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { areaRouter } from "../modules/areas/area.routes.js";
import { projectRouter } from "../modules/projects/project.routes.js";
import { taskRouter } from "../modules/tasks/task.routes.js";
import { resourceRouter } from "../modules/resources/resource.routes.js";
import { inboxRouter } from "../modules/inbox/inbox.routes.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import { searchRouter } from "../modules/search/search.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/areas", areaRouter);
apiRouter.use("/projects", projectRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/resources", resourceRouter);
apiRouter.use("/inbox", inboxRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/search", searchRouter);
