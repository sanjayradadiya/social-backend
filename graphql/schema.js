const { buildSchema } = require("graphql");

const schema = buildSchema(`
    enum FriendRequestStatus {
        PENDING
        ACCEPTED
        REJECTED
    }
    enum OrderBy {
        ASC
        DESC
    }

    directive @formatDate(
        format: String = "YYYY-MM-DD"
    ) on FIELD_DEFINITION

    type User {
        id: ID!
        username: String! 
        email: String!
        role: String!
        bio: Bio
        interests: [String]
        privacy: String
        accountStatus: String
        createdAt: String @formatDate
        updatedAt: String
        posts: PostPagination
        friendRequest: [String]
        friendInfo: Friends
    }

    type PostPagination {
        totalPosts: Int
        edges: [PostEdge]
        pageInfo: PageInfo!
    }
      
    type PostEdge {
        cursor: String!
        node: Post!
    }
      
    type PageInfo {
        previousCursor: String
        nextCursor: String
    }

    type Friends{
        userId: String
        friendRequests: [FriendsRequest]
    }

    type FriendsRequest{
        senderId: String
        receiverId: String
        status: FriendRequestStatus
    }
    type Bio{
        highSchools: [HighSchool]
        colleges: [college]
        maritalStatus: Boolean
        birth: String
        hometown: String
        currentCity: String 
    }
    type HighSchool{
        name: String
        joinDate: String
        endDate: String
    }
    type college{
        name: String
        joinDate: String
        endDate: String
        semesters: [String]
        lastYear: Boolean
    }
    type Post{
        posterId: String
        name: String
        description: String
        comments: [Comment]
        likes: TotalLike
    }
    type Comment{
        friendsId: String
        username: String
        message: String
    }
    type TotalLike{
        totalLike: Int
        edges: [Likes]
    }
    type Likes{
        friendsId: String
        username: String
        like: Boolean
    }
    input UserInput {
        username: String
        email: String
        password: String
        bio: BioInput
    }
    input BioInput{
        highSchools: [HighSchoolInput]
        colleges: [collegeInput]
        maritalStatus: Boolean
        birth: String
        hometown: String
        currentCity: String
    }
    input HighSchoolInput{
        name: String
        joinDate: String
        endDate: String
    }
    input collegeInput{
        name: String
        joinDate: String
        endDate: String
        semesters: [String]
        lastYear: Boolean
    }
    input PostInput{
        name: String
        description: String
    }
    input FriendsInput{
        receiverId: String
    }
    input CommentsInput{
        postId: String
        message: String
    }
    type AuthData{
        token: String!
    }

    input Order{
        username: OrderBy,
        email: OrderBy,
        createdAt: OrderBy
    }
    input Filter{
        username: String,
        email: String
    }

    type Query {
        getProfile(limit: Int, cursor: String): User
        getUsers(orderBy: Order, filter: Filter): [User] 
        getPost(id: String): Post
    }

    type Mutation {
        createUser(input: UserInput): AuthData
        updateUser(username: String, email: String): User
        login(email: String!, password: String!): AuthData
        changePassword(oldPassword: String!, newPassword: String!): String
        updateProfile(input: UserInput): String
        addHighSchool(input: HighSchoolInput): String
        addBio(input: BioInput): String
        addCollege(input: collegeInput): String
        addPost(input: PostInput): Post
        sendFriendRequest(input: FriendsInput): Friends
        addComment(input: CommentsInput): [Comment]
        addLike(postId: String): [Likes]
    }

    type Subscription {
        commentAdded(postID: ID!): Comment
    }
`);

module.exports = schema;
