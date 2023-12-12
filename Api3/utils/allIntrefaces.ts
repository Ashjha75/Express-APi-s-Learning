interface mailOptions {
    email: string,
    subject: string,
    mailgenContent: any
}
interface AvatarUser {
    userName: string;
}

export { mailOptions, AvatarUser }