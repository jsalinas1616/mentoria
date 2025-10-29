# Permisos AWS - Parte 1: Backend Infrastructure
## Policy Name: `NadroMentoria-Backend-Policy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationManagement",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStackResource",
        "cloudformation:DescribeStackResources",
        "cloudformation:GetTemplate",
        "cloudformation:CreateChangeSet",
        "cloudformation:DescribeChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:ListStackResources",
        "cloudformation:GetStackPolicy",
        "cloudformation:SetStackPolicy"
      ],
      "Resource": [
        "arn:aws:cloudformation:us-east-1:637423546677:stack/nadro-mentoria-api-qa/*"
      ]
    },
    {
      "Sid": "CloudFormationGlobalOperations",
      "Effect": "Allow",
      "Action": [
        "cloudformation:ListStacks",
        "cloudformation:ListExports",
        "cloudformation:ValidateTemplate"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": [
        "arn:aws:iam::637423546677:role/nadro-mentoria-api-qa-*"
      ]
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::637423546677:role/nadro-mentoria-api-qa-*"
      ],
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "lambda.amazonaws.com"
        }
      }
    },
    {
      "Sid": "IAMListRoles",
      "Effect": "Allow",
      "Action": [
        "iam:ListRoles"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMReadPolicies",
      "Effect": "Allow",
      "Action": [
        "iam:GetGroupPolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListAttachedUserPolicies",
        "iam:ListUserPolicies"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaManagement",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:ListFunctions",
        "lambda:ListVersionsByFunction",
        "lambda:PublishVersion",
        "lambda:AddPermission",
        "lambda:RemovePermission",
        "lambda:GetPolicy",
        "lambda:TagResource",
        "lambda:UntagResource"
      ],
      "Resource": [
        "arn:aws:lambda:us-east-1:637423546677:function:nadro-mentoria-api-qa*"
      ]
    },
    {
      "Sid": "AllowListHttpApis",
      "Effect": "Allow",
      "Action": "apigateway:GET",
      "Resource": "arn:aws:apigateway:us-east-1::/apis"
    },
    {
      "Sid": "AllowCreateHttpApis",
      "Effect": "Allow",
      "Action": "apigateway:POST",
      "Resource": "arn:aws:apigateway:us-east-1::/apis"
    },
    {
      "Sid": "ManageSpecificHttpApis",
      "Effect": "Allow",
      "Action": "apigateway:*",
      "Resource": [
        "arn:aws:apigateway:us-east-1::/apis/*",
        "arn:aws:apigateway:us-east-1::/apis/*/routes",
        "arn:aws:apigateway:us-east-1::/apis/*/routes/*",
        "arn:aws:apigateway:us-east-1::/apis/*/stages",
        "arn:aws:apigateway:us-east-1::/apis/*/stages/*",
        "arn:aws:apigateway:us-east-1::/apis/*/deployments",
        "arn:aws:apigateway:us-east-1::/apis/*/deployments/*",
        "arn:aws:apigateway:us-east-1::/apis/*/integrations",
        "arn:aws:apigateway:us-east-1::/apis/*/integrations/*",
        "arn:aws:apigateway:us-east-1::/apis/*/authorizers",
        "arn:aws:apigateway:us-east-1::/apis/*/authorizers/*",
        "arn:aws:apigateway:us-east-1::/tags/*"
      ]
    },
    {
      "Sid": "ResourceGroupsTagging",
      "Effect": "Allow",
      "Action": [
        "tag:TagResources",
        "tag:UntagResources",
        "tag:GetResources"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBManagement",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:UpdateTable",
        "dynamodb:DeleteTable",
        "dynamodb:DescribeTable",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:UpdateTimeToLive",
        "dynamodb:ListTagsOfResource",
        "dynamodb:TagResource",
        "dynamodb:UntagResource"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:637423546677:table/NadroMentoria-Consultas-qa",
        "arn:aws:dynamodb:us-east-1:637423546677:table/NadroMentoria-Capacitaciones-qa",
        "arn:aws:dynamodb:us-east-1:637423546677:table/NadroMentoria-Usuarios-qa"
      ]
    },
    {
      "Sid": "DynamoDBListOperations",
      "Effect": "Allow",
      "Action": [
        "dynamodb:ListTables"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsManagement",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy",
        "logs:TagResource",
        "logs:UntagResource"
      ],
      "Resource": [
        "arn:aws:logs:us-east-1:637423546677:log-group:/aws/lambda/nadro-mentoria-api-qa*"
      ]
    },
    {
      "Sid": "SSMParameterManagement",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:PutParameter",
        "ssm:DeleteParameter"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:637423546677:parameter/serverless-framework/*"
      ]
    }
  ]
}
```

