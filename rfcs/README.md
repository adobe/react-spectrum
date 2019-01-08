# React Spectrum RFCs

Many changes, including bug fixes and documentation improvements, can be implemented and reviewed via the normal GitHub pull request workflow.

However, some changes are “substantial”, and we ask that these be put through a bit of a design process and produce a consensus among the React-Spectrum core team.

The “RFC” (request for comments) process is intended to provide a consistent and controlled path for new features and components to enter the project.

## When you need to follow this process

You need to follow this process if you intend to make "substantial" changes to the React Spectrum project or its documentation. What constitutes a "substantial" change is evolving based on community norms, but may include the following.

* A new React Spectrum Component (hopefully it already exists in spectrum)
* Any breaking change (like modifying the API of a component)

Some changes do not require an RFC:

* Rephrasing, reorganizing or refactoring
* Additions that strictly improve objective, numerical quality criteria (speedup, better browser support)
* Additions only likely to be noticed by other implementors-of-React-Spectrum, invisible to users-of-React-Spectrum.

In addition to these, the React-Spectrum core team may request an RFC for any other change that it deems "substantial" based on the size or scope of the request.

If you submit a pull request to implement a new feature without going through the RFC process, it may be closed with a polite request to submit an RFC first.

## Gathering feedback before submitting

It's often helpful to get feedback on your concept before diving into the level of API design detail required for an RFC. You may open an issue on this repo to start a high-level discussion, with the goal of eventually formulating an RFC pull request with the specific implementation design.

## How to submit an RFC

To submit a new RFC, follow these steps:

1. Fork this repo.
2. Create a directory inside this `rfcs` directory. The directory name should begin with the year and include a meaningful description, such as `rfcs/2018-cyclebutton-new-component`.
3. Copy the [template.md](template.md) file from this `rfcs` directory into your newly created subdirectory (such as `rfcs/2018-cyclebutton-new-componet/README.md`). Be sure to name your file `README.md` so it is easily viewable in the GitHub interface.
4. If you want to include images in your RFC, place them in the same directory as the `README.md`.
5. Fill in the RFC. Please fill in every section in the template with as much detail as possible.
6. Submit a pull request to this repo with all of your files.
7. You will receive feedback both from the React-Spectrum community and from the React-Spectrum core team. You should be prepared to update your RFC based on this feedback. The goal is to build consensus on the best way to implement the suggested change.
8. When all feedback has been incorporated, the React-Spectrum core team will determine whether or not to accept the RFC.
RFCs that are accepted will be merged directly into this repo; RFCs that are not accepted will have their pull requests closed without merging.

## The RFC life-cycle

Once an RFC is merged into this repo, then the authors may implement it and submit a pull request to this repo without opening an issue. Note that the implementation still needs to be reviewed separate from the RFC, so you should expect more feedback and iteration.

If the RFC authors choose not to implement the RFC, then the RFC may be implemented by anyone. There is no guarantee that RFCs not implemented by their author will be implemented by the React-Spectrum core team.

Changes to the design during implementation should be reflected by updating the related RFC. The goal is to have RFCs to look back on to understand the motivation and design of shipped React-Spectrum features.

## Implementing an RFC

The author of an RFC is not obligated to implement it. Of course, the RFC author (like any other developer) is welcome to post an implementation for review after the RFC has been accepted.

When a pull request has implemented an RFC, the RFC should be updated with a link to the PR implementing it.

**Thanks to the [Ember RFC process](https://github.com/emberjs/rfcs) and [ESLint RFC Process](https://github.com/eslint/rfcs/) for the inspiration for React Spectrum's RFC process.**