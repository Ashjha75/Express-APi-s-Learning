export class CustomErrors extends Error {
    // it takes message as input and pass it to its parent(Error class) constructor through super()
    constructor(message: string) {
        super(message);
    }
}

