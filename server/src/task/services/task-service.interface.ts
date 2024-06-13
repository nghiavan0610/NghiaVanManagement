export interface ITaskService {
    approveTimesheet(): Promise<void>;
}

export const ITaskService = Symbol('ITaskService');
