import { AcceptAny } from "./type";
interface Response {
    status: string;
    code: number;
    timestamp: number;
}

export interface HttpResponse extends Response {
    data: Record<string, AcceptAny> | null;
    error: Record<string, AcceptAny> | null;
    message?: string | null;
}
export interface INODEMAILER_CONFIG {
    service: string;
    auth: {
        user: string;
        pass: string;
    };
}

export interface adminLogin {
    email : string;
    password : string;
}

export interface addProruct{
        title: string,
        price: number,
        quantity : number,
        description: string,
        imageUrl: string,
}