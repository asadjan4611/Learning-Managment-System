import nodemailer,{Transporter} from "nodemailer"
import ejs from 'ejs'
import path from "path";
require('dotenv').config();

interface EmialOption{
    email:string,
    subject:string,
    template:string,
    data:{[key:string]:any}

}

export const sendMail =async (options:EmialOption)  :Promise<void> =>{
      const transporter = nodemailer.createTransport({
         host:process.env.SMPT_HOST,
         port:parseInt(process.env.SMPT_PORT  ||"587"),
         service:process.env.SERVICE,
          auth:{
         user:process.env.SMPT_MAIL,
         pass:process.env.SMPT_PASSWORD,

          }   
      });

    const {email,subject,data,template  } = options;
    const templatePath  = path.join(__dirname ,'../mails',template);
    const html:string =  await ejs.renderFile(templatePath,data);




      const mailOptions ={
           from:process.env.SMPT_MAIL,
           to:email,
           subject,
           html
           
          }

          await transporter.sendMail(mailOptions)
}

 