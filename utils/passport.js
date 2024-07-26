import passport from 'passport';
import { Strategy as GoogleStategy } from "passport-google-oauth20"
import User from '../models/user.model.js';

const Passport = (app) => {
    app.use(passport.initialize())
passport.use(
        new GoogleStategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/auth/google/callback",
                passReqToCallback: true
            }, async (req, accessToken, refreshToken, profile, callback) => {
                try {
                    let user = await User.findOne({email:profile.emails[0].value})
                    if(user){
                        // user is already signup
                        user.googleId = profile.id
                        await user.save()
                        req.session.userId = user._id
                        return callback(null,user)
                    }
                    user = new User({
                        googleId:profile.id,
                        email:profile.emails[0].value,
                        username:profile.displayName,
                        profilePicture:profile.photos[0].value,
                    })
                    await user.save()
                    req.session.userId = user._id
                    return callback(null,user)
                } catch (error) {
                    console.error(error)
                    return callback(error,null)
                }
            }
        )
    )

    passport.serializeUser((user,done)=>{
       done(null,user.id)
    })

    passport.deserializeUser(async(id,done)=>{
         try{
          const user = await User.findById(id)
          done(null,user)
         }catch(error){
            done(error,null)
         }
    })
}

export default Passport;
