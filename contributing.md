Contributing
===
Welcome to the world of content development in High Fidelity! This project is actively maintained by the High Fidelity Experiences development team and we welcome contributions of content that you'd like to share with the community under the [Apache 2.0 License](https://github.com/highfidelity/hifi-content/blob/master/LICENSE), either as part of your own work or through a request made as part of the [High Fidelity Development Fund](https://blog.highfidelity.com/cashing-out-earn-and-exchange-high-fidelity-coins-hfc-for-u-s-dollars-bfa3b8cb3ebc).

The High Fidelity Development Fund
===
The High Fidelity Development Fund is a way for members of our community can take on projects to extend the High Fidelity platform. There are dozens of features we’re planning to add, and we’re looking to developers in our community to sign up to create them. Of course, we’re planning to pay them for their hard work — in HFC, which they can convert to legal tender.

We’ve set up a [public group on Telegram](https://t.me/highfidelityvr) which developers can use to contact us about these projects. We plan to regularly post new opportunities to the channel for people to select and bid for. The aim here is to reward our most dedicated members, to accelerate feature rollout, and to inject more activity into the economy, which in turn will benefit everyone.

In this first wave of the Fund, we’re committing 1,000,000 HFC to fund developers. Use the Telegram channel to bid on initiatives, propose new projects, and suggest new features for the platform. [Sign up here to learn more](https://t.me/highfidelityvr).

Submitting Community Project Proposals
===
Please use the GitHub Issues tracking tab to submit a new issue or High Fidelity Developer Fund initiative. Tag these with the labels 'Community' and ensure that you are managing your proposals and updating the status accordingly as the projects are approved or worked on. We resolve the right to close issues that do not adhere to our guidelines or code of conduct, do not align with our community standards, or are left unresolved for extended time without update. 

Submitting a Pull Request
===

1. Fork the repository to your own GitHub account.
2. Clone your fork of the repository locally

  ```
  git clone git://github.com/USERNAME/hifi-content.git
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
  git remote add upstream https://github.com/highfidelity/hifi-content
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
  
9. Tag your pull request with the appropriate labels for the project that you are working on so we can track progress with the High Fidelity Developer Fund projects and internal initiatives. PRs that are made by contributors outside of the High Fidelity staff team should be tagged 'Community'. If you would like specific feedback on a PR or an issue, please use the 'Feedback Welcome' tag.  

All submissions are subject to a code review from an approved contributor. 

LFS
===
Certain file types in hifi-content are tracked by [Git Large File Storage (LFS)](https://git-lfs.github.com/) Install LFS on your development machine to ensure the following file types are tracked properly: 
* OBJ
* FBX
* WAV
