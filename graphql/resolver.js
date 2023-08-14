const User = require("./models/user");
const Post = require("./models/post");
const Friends = require("./models/friends");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// get token from cookie and authenticate user
async function authenticatedUser(req) {
  const cookies = req.headers.cookie;
  if (!cookies) {
    throw new Error("No cookies found");
  }
  const cookiePairs = cookies.split(";");
  const cookieMap = {};
  cookiePairs.forEach((pair) => {
    const [key, value] = pair.trim().split("=");
    cookieMap[key] = value;
  });
  const token = cookieMap.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id);
  return user;
}

// using cursor wise pagination 

// get encoded string
function cursorToOffset(cursor) {
  const decodedCursor = Buffer.from(cursor, 'base64').toString('utf8')  
  return decodedCursor;
}

// get encoded string
function offsetToCursor(offset) {
  const buffer2 = Buffer.from(offset);
  const encodedCursor = buffer2.toString('base64');
  return encodedCursor;
}

const resolvers = {
  // Get profile with cursor pagination on post
  getProfile: async ({limit, cursor}, { req }) => {
    try {

      //If no limit provide give 3.
      if(!limit){
         limit = 3
      }

      let startIndex = 0;
      let encodeCursor = null;
      let decodedCursor = null;
      const user = await authenticatedUser(req);
      const posts = await Post.find({ posterId: user._id });

      for(const post of posts){
        post.likes.totalLike = post.likes.length
        for(const like of post.likes){
          username = await User.findOne({ _id: like.friendsId})
          like.username = username.username
        }
        post.likes.edges = post.likes

        for(const comments of post.comments){
          username = await User.findOne({ _id: comments.friendsId})
          comments.username = username.username
        }
      }

      if(!cursor){
        encodeCursor = offsetToCursor(posts[3].name)
        decodedCursor = cursorToOffset(encodeCursor)
        slicedPosts = posts.slice(0, 3);
      }
      
      if (cursor) {
        decodedCursor = cursorToOffset(cursor)
        const foundIndex = posts.findIndex((post) => post.name === decodedCursor);
        if (foundIndex !== -1) {
          startIndex = foundIndex;
        }
        if (limit) {
          endIndex = startIndex + limit;
        }
        slicedPosts = posts.slice(startIndex, endIndex);
        encodeCursor = (endIndex < posts.length) ? offsetToCursor(posts[endIndex].name) : null;  
      }  
       
      totalPosts =  posts.length
      const edges = slicedPosts.map((post) => ({
        cursor: offsetToCursor(post.name),
        node: post,
      }));

      let nextCursor = null;
      let previousCursor = null;
      if (edges.length > 0) {
        nextCursor = encodeCursor;
        if (startIndex > 0) {
          previousCursor = (startIndex - limit > -1) ? offsetToCursor(posts[startIndex - limit].name) : null;
        }
      }

      postPagination =  {
        totalPosts,
        edges,
        pageInfo: {
          nextCursor,
          previousCursor
        }
      }
      user.posts = postPagination;
      const friends = await Friends.findOne({ userId: user._id });
      const friendsReqCheck = await Friends.find({});
      user.friendInfo = friends;
      return user;

    } catch (err) {
      console.log(err.message)
      throw new Error("Failed to fetch profile");
    }
  },

  // create new user
  createUser: async ({ input }, { res }) => {
    try {
      const { username, email, password, bio } = input;
      const user = new User({ username, email, password, bio });
      await user.save();
      const token = await user.generateAuthToken();
      res.cookie("token", token, { httpOnly: true });
      return { token };
    } catch (err) {
      throw new Error("Failed to create user");
    }
  },

  // user login mutation
  login: async ({ email, password }, { res }) => {
    try {
      const user = await User.findByCredentials(email, password);
      const token = await user.generateAuthToken();
      res.cookie("token", token, { httpOnly: true });
      return { token };
    } catch (err) {
      throw new Error("Failed to log in");
    }
  },

  //highschool mutation
  addHighSchool: async ({ input }, { req }) => {
    const user = await authenticatedUser(req);
    const { name, joinDate, endDate } = input;
    highschool = {
      name: name,
      joinDate: joinDate,
      endDate: endDate,
    };
    user.bio.highSchools.push(highschool);
    user.save();
    return "highschool added successfully";
  },

  //Bio mutation
  addBio: async ({ input }, { req }) => {
    const user = await authenticatedUser(req);
    const {
      highSchools,
      colleges,
      maritalStatus,
      birth,
      hometown,
      currentCity,
    } = input;

    console.log(highSchools);
    if (maritalStatus) {
      user.bio.maritalStatus = maritalStatus;
    }
    if (birth) {
      user.bio.birth = birth;
    }
    if (hometown) {
      user.bio.hometown = hometown;
    }
    if (currentCity) {
      user.bio.currentCity = currentCity;
    }

    user.save();
    return "Bio added successfully";
  },

  //college mutation
  addCollege: async ({ input }, { req }) => {
    const user = await authenticatedUser(req);
    const { name, joinDate, endDate, semesters, lastYear } = input;
    college = {
      name: name,
      joinDate: joinDate,
      endDate: endDate,
      semesters: semesters,
      lastYear: lastYear,
    };
    user.bio.colleges.push(college);
    user.save();
    return "College added successfully";
  },

  // update profile mutation
  updateProfile: async ({ input }, { req }) => {
    const user = await authenticatedUser(req);
    // update profile
  },

  // password change mutation
  changePassword: async ({ oldPassword, newPassword }, { req }) => {
    try {
      const user = await authenticatedUser(req);
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error("old_password does not match");
      }
      console.log(oldPassword, newPassword);
      user.password = newPassword;
      user.save();
      if (user) {
        return "password changed successfully";
      }
    } catch (err) {
      throw new Error("Failed to change password");
    }
  },

  // getUsers query
  getUsers: async ({orderBy, filter}, { req }) => {

    let users = await User.find();
    if (filter) {
      users = users.filter(user => {
        let includeUser = true;
        
        // Check the filtering conditions based on the filter parameter
        if (filter.username && !user.username.startsWith(filter.username)) {
          includeUser = false;
        }
        if (filter.email && !user.email.startsWith(filter.email)) {
          includeUser = false;
        }
        
        return includeUser;
      });
    }
    
    if (orderBy) {
      const field = Object.keys(orderBy)[0];
      const order = orderBy[field];

      users.sort((a, b) => {
        if (order === 'ASC') {
          return a[field] > b[field] ? 1 : -1;
        } else if (order === 'DESC') {
          return a[field] < b[field] ? 1 : -1;
        }
        return 0;
      });
    }
    return users;
  },

  // upload new post mutation
  addPost: async ({ input }, { req }) => {
    const user = await authenticatedUser(req);
    const { name, description } = input;
    posterId = user._id;
    const post = new Post({ posterId, name, description });
    await post.save();
    return post;
  },

  // get post query
  getPost: async ({ id }, { req }) => {
    try {
      const user = await authenticatedUser(req);
      posterId = user._id;
      console.log(id);
      const post = await Post.findOne({ posterId: posterId, _id: id });
      console.log(post);
      return post;
    } catch (err) {
      throw new Error("Failed to fetch post");
    }
  },

  // add comment on uploaded post mutation
  addComment:  async ({input}, { req }) => {
    try{
      const user = await authenticatedUser(req);
      const {postId, message} = input
      const post = await Post.findOne({ _id: postId, });
      if(post){
        comment = {
          friendsId: user._id, 
          message: message
        }
        post.comments.push(comment)
        post.save()
        console.log(post.comments)
        return post.comments
      }
    }
    catch (err) {
      throw new Error(err.message);
    }
    
  },

  // add like on uploaded post mutation
  addLike: async ({postId}, { req }) => {
    try{
      const user = await authenticatedUser(req);
      const post = await Post.findOne({ _id: postId, });
      if(post){
        like = {
          friendsId: user._id, 
        }
        post.likes.push(like)
        post.save()
        console.log(post.comments)
        return post.likes
      }
    }
    catch (err) {
      throw new Error(err.message);
    }
    
  },

  // send friend request mutation
  sendFriendRequest: async ({ input }, { req }) => {
    try {
      const user = await authenticatedUser(req);
      const { receiverId } = input;
      senderId = user._id;
      const friendsReqCheck = await Friends.findOne({ userId: senderId });
      if (friendsReqCheck) {
        const checkReceiver = friendsReqCheck.friendRequests.findIndex(
          (receiver) => receiver.receiverId == receiverId
        );
        if (checkReceiver > -1) {
          throw new Error("already sended request");
        }
        requests = {
          senderId: senderId,
          receiverId: receiverId,
        };
        friendsReqCheck.friendRequests.push(requests);
        friendsReqCheck.save();
        return friendsReqCheck;
      }
      const friends = new Friends({
        userId: senderId,
        "friendRequests.0.senderId": senderId,
        "friendRequests.0.receiverId": receiverId,
      });
      friends.save();
      return friends;
    } catch (err) {
      throw new Error(err.message);
    }
  },
};
module.exports = resolvers;
