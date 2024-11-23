import jwt from 'jsonwebtoken'

export function generateJwtToken(id: string){

    console.log("Secret vlaue", process.env.JWT_SECRET);

    return jwt.sign(
        {
            id,
            iat: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000),
            type: 'access_token'
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256'}
    )
}


