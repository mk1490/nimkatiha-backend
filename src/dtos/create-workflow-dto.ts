import {WorkflowActions} from "../enums/workflowActions";

export class CreateWorkflowDto {
    id?: string;
    requestDescription: string;
    responseTo?: string;
    recordId: string;
    controller: string;
    status: number;
    summaryDescription?: string;
    body: string;
    targetUserPermission?: string;
    creatorId: string;
    action: WorkflowActions
    determinedStatus?: number;
}