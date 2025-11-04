
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CognitoUserManagementFull",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminResetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminEnableUser",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:AdminListGroupsForUser",
        "cognito-idp:ListUsers",
        "cognito-idp:ListUsersInGroup",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:ListGroups",
        "cognito-idp:GetGroup",
        "cognito-idp:AdminConfirmSignUp",
        "cognito-idp:AdminSetUserMFAPreference"
      ],
      "Resource": [
        "arn:aws:cognito-idp:us-east-1:767398004339:userpool/*"
      ]
    },
    {
      "Sid": "DynamoDBFullDataAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:DescribeTable",
        "dynamodb:ListTables",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:ListTagsOfResource"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Consultas-prod",
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Consultas-prod/index/*",
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Capacitaciones-prod",
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Capacitaciones-prod/index/*",
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Usuarios-prod",
        "arn:aws:dynamodb:us-east-1:767398004339:table/NadroMentoria-Usuarios-prod/index/*"
      ]
    },
    {
      "Sid": "S3FrontendFullAccess",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketWebsite",
        "s3:PutBucketWebsite",
        "s3:GetBucketVersioning",
        "s3:GetBucketCors",
        "s3:PutBucketCors",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock"
      ],
      "Resource": [
        "arn:aws:s3:::nadro-mentoria-frontend-prod*",
        "arn:aws:s3:::nadro-mentoria-frontend-prod*/*"
      ]
    },
    {
      "Sid": "LambdaReadAndInvoke",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:ListVersionsByFunction",
        "lambda:GetPolicy",
        "lambda:InvokeFunction",
        "lambda:ListTags"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:767398004339:function:nadro-mentoria-api-prod*"
      ]
    },
    {
      "Sid": "CloudWatchLogsFullRead",
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:DescribeQueries",
        "logs:GetQueryResults"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:767398004339:log-group:/aws/lambda/nadro-mentoria-api-prod*",
        "arn:aws:logs:us-east-1:767398004339:log-group:/aws/lambda/nadro-mentoria-api-prod*:*"
      ]
    },
    {
      "Sid": "CloudFormationReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResource",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:ListStackResources",
        "cloudformation:ListStacks"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3ListAllBuckets",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation"
      ],
      "Resource": "*"
    }
  ]
}
```
