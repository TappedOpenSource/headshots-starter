
export type AiModel = {
    id: string;
    name: string;
    userId: string;
    type: 'image'
    status: 'initial'
    | 'training'
    | 'ready'
    | 'errored';
}
