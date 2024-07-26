const userTypeDefs = `#graphql

type User {
    _id: ID!
    email: String!
    name: String!
    profilePicture: String
    gender: String,
    phoneNumber: String
}

type Query {
    authUser: User
    user(userId: ID!): User
}

type Mutation {
    signUp(input: SignUpInput!): User
    login(input: LoginInput!): User
    logOut: LogOutResponse
    forgetPasswordEmail(input: ForgetPasswordInput!): ForgetPasswordResponse
    resetPassword(input: ResetPasswordInput!): ForgetPasswordResponse
}

input SignUpInput {
    email: String!
    name: String!
    password: String!
}

input LoginInput {
    email: String!
    password: String!
}

type LogOutResponse {
    message: String!
}

input ForgetPasswordInput {
    email: String!
}

input ResetPasswordInput {
    token: String!
    newPassword: String!
}

type ForgetPasswordResponse {
    message: String!
}
`

export default userTypeDefs;