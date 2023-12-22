import { AcceptAny } from "../interface/type";
import { HttpStatusMessage, ExceptionMessage } from "../interface/enum";
import { HttpResponse } from "../interface/gobal.interface";
import { HttpStatusCode } from "../interface/enum";
class ResponseUitls{
    /**
     * @description Construct Success Response Object
     * @param {Record<string, AcceptAny>} data Actual Data to be Provided in Response
     * @param {number} status Status Code for Response
     * @param {string} statusMsg Status Msg for Response
     * @returns {HttpResponse} Response Object
     */
    successResponse(
        data: Record<string, AcceptAny>,
        message: string = HttpStatusMessage.OK,
        status: string = HttpStatusMessage.OK,
    ): HttpResponse {
        const response: HttpResponse = {
            code: this.getStatusCode(<keyof typeof HttpStatusCode>status),
            status: status,
            message: message,
            timestamp: new Date().getTime(),
            data: data,
            error: null,
        };
        return response;
    }
    errorResponse(
        error: AcceptAny,
        message: ExceptionMessage = ExceptionMessage.SOMETHING_WENT_WRONG,
        status: HttpStatusMessage = HttpStatusMessage.BAD_REQUEST
    ): HttpResponse {
        const ErrorResponse: HttpResponse = {
            code: error?.code || this.getStatusCode(<keyof typeof HttpStatusCode>status),
            status: error?.status || status,
            message: error?.message || message,
            timestamp: new Date().getTime(),
            data: null,
            error: error.data || error,
        };

        return ErrorResponse;
    }

    private getStatusCode(code: keyof typeof HttpStatusCode): number {
        return HttpStatusCode[code] || HttpStatusCode.BAD_REQUEST;
    }

    
}
export const responseUitls=new ResponseUitls()