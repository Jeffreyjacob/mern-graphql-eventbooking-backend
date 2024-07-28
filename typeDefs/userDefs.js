const userTypeDefs = `#graphql

type User {
    _id: ID!
    email: String!
    name: String!
    profilePicture: String
    gender: String,
    phoneNumber: String,
    event:[Event]
    BookedEvent:[Booking]
}
type Query {
    authUser: User
    user: User
}

type Mutation {
    signUp(input: SignUpInput!): User
    login(input: LoginInput!): User
    logOut: LogOutResponse
    forgetPasswordEmail(input: ForgetPasswordInput!): ForgetPasswordResponse
    resetPassword(input: ResetPasswordInput!): ForgetPasswordResponse
    updateUser(input:UpdateUserInput!):User
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
input UpdateUserInput{
    name: String
    profilePicture: String
    gender: String,
    phoneNumber: String
}
`

export default userTypeDefs;