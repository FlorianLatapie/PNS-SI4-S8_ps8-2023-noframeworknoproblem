sudo yum update
sudo yum upgrade
sudo yum install git
sudo yum install docker

sudo usermod -a -G docker ec2-user

sudo yum-config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
sudo yum install gh
sudo yum update gh

sudo yum install htop
