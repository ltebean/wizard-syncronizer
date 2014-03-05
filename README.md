## Installation

Node.js runtime environment is required.
Clone the repo and execute the following command:
	
	sudo npm link 

## Usage

### Setup your account

	wizard login --help
	
	Options:
    -l, --username [username]  username
    -p, --password [password]  password
    -e, --env [env]            environment {alpha|beta|pre|product}, 	default to alpha
	
example:
	
	wizard login -l name -p password -e alpha
	
	
### Sync a module from remote repo to server

	wizard sync --help
	
	Options:
    -n, --name [name]        name of the module to commit
    -m, --comment [comment]  your comment
    -b, --branch [branch]    git repo branch
    -e, --env [env]          which environment to commit {alpha|beta|pre|product}
	
example: sync the promo module on branch "feature" to alpha server 
	
	wizard sync -n promo -m comment -b feature -e alpha
