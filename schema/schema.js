const axios = require('axios');
const graphql = require('graphql');
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema
} = graphql;

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: {
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString }		
	}
});

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: {
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		age: { type: GraphQLInt },
		company: {
			type: CompanyType,
			resolve(parentValue, args) {
				console.log(parentValue)
				return axios.get(`http://127.0.0.1:3000/companies/${parentValue.companyId}`)
					.then(res => res.data);
			}
		}
	}
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve(parentValue, args){
				return axios.get(`http://127.0.0.1:3000/users/${args.id}`)
					.then(resp => resp.data);
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery
});