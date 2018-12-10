const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { hasPermission } = require("../utils");
const { transport, makeANiceEmail } = require("../mail");

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// check if they are logged in
		if (!ctx.request.userId) {
			throw new Error("You must be logged in to do that");
		}
		const item = await ctx.db.mutation.createItem(
			{
				data: {
					// building relationships between item and user
					user: {
						connect: {
							id: ctx.request.userId,
						},
					},
					...args,
				},
			},
			info
		);
		return item;
	},
	updateItem(parent, args, ctx, info) {
		//  take a copy of the updates
		const updates = { ...args };
		// remove id from the updates
		delete updates.id;
		// run the update method
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id,
				},
			},
			info
		);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// find item
		const item = await ctx.db.query.item({ where }, `{id title user {id}}`);
		//check if they own it or has permissions
		const ownsItem = item.user.id === ctx.request.userId;
		const hasPermissions = ctx.request.user.permissions.some(permission =>
			["ADMIN", "ITEMDELETE"].includes(permission)
		);

		if (!ownsItem && hasPermissions) {
			throw new Error("You don't have permission to do that.");
		}
		// delete
		return ctx.db.mutation.deleteItem({ where }, info);
	},
	async signup(parent, args, ctx, info) {
		// always lowercase the email
		args.email = args.email.toLowerCase();
		// hash the password
		const password = await bcrypt.hash(args.password, 13);
		// create the user in the db
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: ["USER"] },
				},
			},
			info
		);
		// create JWT token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// set the jwt as a cookie on the response
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		});
		// return the user
		return user;
	},
	async signin(parent, { email, password }, ctx, info) {
		// 1. check if there is a user with that email
		const user = await ctx.db.query.user({ where: { email } });
		if (!user) {
			throw new Error(`No such user found for email ${email}`);
		}
		// 2. Check if their password is correct
		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			throw new Error("Invalid Password!");
		}
		// 3. generate the JWT Token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// 4. Set the cookie with the token
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});
		// 5. Return the user
		return user;
	},
	signout(parent, args, ctx, info) {
		ctx.response.clearCookie("token");
		return { message: "Goodbye" };
	},
	async requestReset(parent, args, ctx, info) {
		// check if this is a real user
		const user = await ctx.db.query.user({
			where: { email: args.email },
		});
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}
		// reset token and expiry
		const randomBytesPromisified = promisify(randomBytes);
		const resetToken = (await randomBytesPromisified(20)).toString("hex");
		const resetTokenExpiry = Date.now() + 3600000;
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry },
		});
		// email reset token
		const mailRes = await transport.sendMail({
			from: "jay@smoelt.com",
			to: user.email,
			subject: "Password Reset Token",
			html: makeANiceEmail(`Your password reset token is here 
			\n\n 
			<a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
		});
		// retrung the messahe
		return { message: "thanks" };
	},
	async resetPassword(parent, args, ctx, info) {
		// do the password match
		if (args.password !== args.confirmPassword) {
			throw new Error("your passwords don't match");
		}
		// check token
		// check if expire
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000,
			},
		});
		if (!user) {
			throw new Error("This token is either invalid or expired");
		}
		// hash new password
		const password = await bcrypt.hash(args.password, 13);
		//save new password to user
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null,
			},
		});

		// generate jwt
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		// set jwt cookie
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
		});
		// return new user
		return updatedUser;
	},
	async updatePermissions(parent, args, ctx, info) {
		// check if they are looged in
		if (!ctx.request.userId) {
			throw new Error("You must be logged in!");
		}
		// check curren tuser
		const currentUser = await ctx.db.query.user(
			{
				where: {
					id: ctx.request.userId,
				},
			},
			info
		);
		// check their peremissioms
		hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
		// update the permissions
		return ctx.db.mutation.updateUser(
			{
				data: {
					permissions: {
						set: args.permissions,
					},
				},
				where: {
					id: args.userId,
				},
			},
			info
		);
	},
};

module.exports = Mutations;
