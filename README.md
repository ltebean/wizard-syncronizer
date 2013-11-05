## Usage

###Setup your account

	wizard login --help
	
	Options:
    -l, --username [username]  username
    -p, --password [password]  password
    -e, --env [env]            environment {alpha|beta|product}, 	default to alpha
	
example:
	
	wizard login -l name -p password -e alpha
	
###Add Configuration

	wizard config --help
	
	Options:
    -g, --git [git]          git repo
    -d, --baseDir [baseDir]  the baseDir to search from
	
example:
	
	wizard config -g http://code.dianpingoa.com/apple/shop-web
	
###Sync a module from remote repo to server

	wizard sync --help
	
	Options:
    -n, --name [name]        name of the module to commit
    -m, --comment [comment]  your comment
    -b, --branch [branch]    git repo branch
    -e, --env [env]          which environment to commit {alpha|beta|product}
	
example: sync the promo module on branch "feature" to alpha server 
	
	wizard sync -n promo -m comment -b feature -e alpha

###Commit a module from local directory to server

	wizard commit --help
	
	Options:
    -n, --name [name]        name of the module to commit
    -m, --comment [comment]  your comment
    -e, --env [env]          which environment to commit {alpha|beta|product}
	
example: commit the promo module to alpha server 
	
	wizard commit -n promo -m comment -e alpha