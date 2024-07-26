import nodeMailer from 'nodemailer';

const sendEmail = (options)=>{
   const transporter = nodeMailer.createTransport({
     host:process.env.EMAIL_HOST,
     service:process.env.EMAIL_SERVICE,
     auth:{
       user:process.env.EMAIL_MAIL,
       pass:process.env.EMAIL_PASSWORD
     }
   })

   const mailOption = {
      from:process.env.EMAIL_MAIL,
      to:options.to,
      subject:options.subject,
      html:options.text
   }
    
   transporter.sendMail(mailOption,function(err,info){
     if(err){
        console.log(err)
     }else{
        console.log(info)
     }
   })
}

export default sendEmail;