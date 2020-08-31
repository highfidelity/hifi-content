Contributing
===
1. Fork the repository to your own GitHub account.
2. Clone your fork of the repository locally

  ```
  git clone git://github.com/USERNAME/vircadia-content.git
  ```
3. Create a new branch
  
  ```
  git checkout -b new_branch_name 
  ```
4. Code
  * Follow the [coding standard](https://docs.highfidelity.com/build-guide/coding-standards)
  * Install and configure [ESLINT](https://eslint.org/) for your editor to apply formatting for scripts 
5. Commit
  * Use well formed commit messages
6. Update your branch
  
  ```
  git remote add upstream https://github.com/highfidelity/vircadia-content
  git pull upstream master
  ```
  Resolve any conflicts that arise with this step.

7. Push to your fork
  
  ```
  git push origin master
  ```
8. Submit a pull request

  *You can follow [GitHub's guide](https://help.github.com/articles/creating-a-pull-request) to find out how to create a pull request.*
  In your pull request, please include a brief test plan that can be run to validate the changes that you've made in your PR.

LFS
===
Certain file types in vircadia-content are tracked by [Git Large File Storage (LFS)](https://git-lfs.github.com/) Install LFS on your development machine to ensure the following file types are tracked properly: 
* OBJ
* FBX
* WAV
