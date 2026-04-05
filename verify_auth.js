import authService from './src/services/authService.js';
import mongoose from 'mongoose';
import mainConfig from './src/config/index.js';

const testDomainValidation = async () => {
    console.log("Testing domain validation...");
    
    const validEmails = ['test@gmail.com', 'user@googlemail.com'];
    const invalidEmails = ['test@yahoo.com', 'user@outlook.com', 'hacker@gmail.co'];

    // We can't easily call register/login because they connect to DB,
    // but we can test the internal `isGoogleEmail` if we exported it or just check the logic.
    // Since isGoogleEmail is local to the service, let's verify if someone can register with Yahoo.
    
    try {
        await authService.register({ email: 'test@yahoo.com', password: 'password', username: 'testuser' });
    } catch (error) {
        console.log("Expected error for yahoo.com:", error.message);
    }

    try {
        await authService.login({ email: 'test@yahoo.com', password: 'password' });
    } catch (error) {
        console.log("Expected error for yahoo.com login:", error.message);
    }
    
    console.log("Verification script finished.");
};

testDomainValidation();
