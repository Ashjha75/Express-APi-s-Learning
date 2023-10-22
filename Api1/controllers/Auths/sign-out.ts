exports.signout = async (req: any, res: any) => {
    const options = {
        expiresIn: new Date(0)
    }
    return res.cookie("access-token", "", options).status(200).json({ success: true, message: "Logout successfully" })
}  