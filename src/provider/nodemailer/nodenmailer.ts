
import { NODEMAILER_CONFIG } from '../../constant/constants';
import { INODEMAILER_CONFIG } from '../../interface/gobal.interface';
import { CustomException } from '../../utils/exception.utils';
import { AcceptAny } from '../../interface/type';
import { ExceptionMessage, HttpStatusMessage } from '../../interface/enum';
import nodemailer from 'nodemailer';
import mailgen from 'mailgen';
class NodeMailer {
    private config: INODEMAILER_CONFIG;
    private senderMailId!: string; //sender mail id
    constructor() {
        this.config = NODEMAILER_CONFIG;
    }
    async sendMail(receiverMailId: string,otp:string,subject: string,name:string) {
        try {
            this.senderMailId = NODEMAILER_CONFIG.auth.user;
            const htmlBody:AcceptAny=await this.templateGenerate(otp,name);
            const transport = nodemailer.createTransport(this.config);
            const mailMessage = {
                from: this.senderMailId, // sender email
                to: receiverMailId, // receiver email
                subject: subject, // Subject line
                text: otp, // plain text body
                html: htmlBody, // html body
            };
            transport
                .sendMail(mailMessage)
                .then(() => {
                    return {};
                })
                .catch(() => {
                    throw new CustomException(
                        ExceptionMessage.SOMETHING_WENT_WRONG,
                        HttpStatusMessage.SERVICE_UNAVAILABLE
                    );
                });
        } catch (error) {
            throw error;
        }
    }
    private templateGenerate=async (otp:string,name:string)=>{
        const mailGenerator=new mailgen({
            theme:"default",
            product:{
                name:"Verification code",
                link:"https://mail.google.com/mail/u/0/#inbox"
            }
        })
        const description={
            body:{
                name: `${name}`,
                intro:`Your OTP is ${otp} and valid for 15 minutes`
            }
    }
    const mail=mailGenerator.generate(description)
    return mail
}
}
export const nodeMailer = new NodeMailer();
