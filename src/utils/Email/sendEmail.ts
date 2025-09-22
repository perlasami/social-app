import nodemailer from 'nodemailer';

export const sendEmail = ({ to, subject, html }:{to:string,subject:string,html:string}) => {
  const transporter = nodemailer.createTransport({
    host:process.env.host,    
    port: Number(process.env.EmailPort),
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.user,
      pass: process.env.pass
    }
  });

  const main = async () => {
    const info = await transporter.sendMail({
      from: `social App<${process.env.user}>`,
      to,
      subject,
      html
    });
  };

  main().catch((err) => {
    console.log(err);
  });
};