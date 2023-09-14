
export type AiModel = {
    id: string;
    userId: string;
    type: 'image'
    status: 'initial'
    | 'training'
    | 'ready'
    | 'errored';
}
