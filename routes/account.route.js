const express = require("express");
const router = express.Router();
const passport = require("../middlewares/auth.mdw");
const bcrypt = require("bcryptjs");
const informationUserModel = require("../models/informationUser.model");
const accountModel = require("../models/account.model");
const config = require("../config/default.json");
const moment = require("moment");
const helper = require("../models/helper.model");
const restrict = require("../middlewares/roleGeneral.mdw");
const retrictPerLogin = require("../middlewares/perLogin.mdw")
const retrictPerLogout = require("../middlewares/perLogout.mdw")

router.get("/login", retrictPerLogin, function (req, res) {
  var m = req.query.message || "";
  req.session.urlReferer = req.headers.referer || "/";
  res.render("../views/account/login", { layout: 'notTemplate', message: m});
});

// router.post('/login', passport.authenticate('local', { successRedirect: '/',
//                                                       failureRedirect: '/flash'}));

router.post("/login", passport.authenticate("local"), function (req, res) {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.redirect(req.session.urlReferer);
});

// router.get('/facebook', passport.authenticate('facebook',  {authType: 'reauthenticate',scope: ['email']}));

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", {
//     successRedirect: "/",
//     failureRedirect: "/account/login",
//   })
// );

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/account/login" }),
  function (req, res) {
    res.redirect(req.session.urlReferer);
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/account/login" }),
  function (req, res) {
    res.redirect(req.session.urlReferer);
  }
);

router.get("/register",retrictPerLogin, function (req, res) {
  res.render("../views/account/register", { layout: 'notTemplate' });
});

router.post("/register", async function (req, res) {
  try {
    const acc = {
      username: req.body.username,
      password: bcrypt.hashSync(
        req.body.password,
        config.authentication.saltRounds
      ),
    };
    await accountModel.addAcc(acc);
    const user = await accountModel.findByUsername(acc.username);
    const info = {
      fullName: req.body.fullname,
      DOB: moment(req.body.DOB, "DD/MM/YYYY").format("YYYY-MM-DD"),
      gender: req.body.gender,
      email: req.body.email,
      phone: req.body.phone,
      idAcc: user.id,
    };
    informationUserModel.add(info);
    res.redirect(
      '/account/login?message="????ng k?? th??nh c??ng. H??y tr???i nghi???m v???i nick b???n v???a ????ng k??"'
    );
  } catch (err) {
    //M??n h??nh th??ng b??o l???i
    res.render("../views/account/register", {
      layout: 'notTemplate',
      message: "L???i h??? th???ng h??y th??? l???i",
    });
  }
});

router.get("/existUsername", async function (req, res) {
  const user = await accountModel.findByUsername(req.query.username);
  if (!user) return res.json(true);
  return res.json(false);
});

router.get("/checkSignIn", async function (req, res) {
  const user = await accountModel.findByUsername(req.query.username);
  if (user) {
    const result = bcrypt.compareSync(req.query.password, user.password);
    return res.json(result);
  }
  return res.json(false);
});

router.get("/forgotPassword", function (req, res) {
  res.render("../views/account/forgotPassword", { layout: 'notTemplate' });
});

router.post("/forgotPassword", async function (req, res) {
  req.session.username = req.body.username;
  req.session.code = await helper.randomCode();
  console.log(req.session.code);
  console.log(req.session.username);

  //G???i gmail code
  var info = await informationUserModel.findByUsername(req.session.username);
  if (info) {
    subject = "M?? x??c th???c ???";
    content = `M?? x??c th???c c???a b???n l?? \n ${req.session.code}`;
    await helper.sendMail(subject, content, info.email);
  }
  res.redirect("/account/confirmCode");
});

//H??y l??m th??m c??i verify email r???i m???i cho truy c???p v??o t??i kho???n

router.get("/checkCode", async function (req, res) {
  return res.json(req.query.code == req.session.code);
});

router.get("/confirmCode", function (req, res) {
  res.render("../views/account/confirmCode", { layout:'notTemplate' });
});

router.post("/confirmCode", function (req, res) {
  //X??a session code
  delete req.session.code;
  res.redirect("/account/updatePassword");
});

router.get("/updatePassword", function (req, res) {
  res.render("../views/account/updatePassword", { layout:'notTemplate' });
});

router.post("/updatePassword", async function (req, res) {
  //Change password
  entity = {
    password: bcrypt.hashSync(
      req.body.password,
      config.authentication.saltRounds
    ),
  };
  if (req.isAuthenticated()) username = req.session.passport.user.username;
  else username = req.session.username;
  condition = {
    username,
  };
  await accountModel.passwordChange(entity, condition);
  //X??a session user
  delete req.session.username;

  if (req.isAuthenticated()) res.redirect("/account/profile");
  else res.redirect("/account/login");
});

router.get("/profile", restrict, async function (req, res) {
  var info = await informationUserModel.findByUsername(
    req.session.passport.user.username
  );
  var isExpired = false;
  var isNew = true;
  if (info.expiredPre.getYear() > 70) {
    isNew = false;
    isExpired = info.expiredPre <= Date.now();
  }
  info.expiredPre = moment(info.expiredPre, "YYYY-MM-DD hh:mm:ss").format(
    "DD-MM-YYYY hh:mm:ss"
  );

  var isMale = info.gender == "Nam";
  var isFemale = info.gender == "N???";
  var isOther = info.gender == "Kh??c";

  res.render("../views/account/profile", {
    layout: 'notTemplate',
    info,
    isWriter: req.session.passport.user.idRole === config.role.idWriter,
    isSubscriber: req.session.passport.user.idRole === config.role.idSubscriber,
    isExpired,
    isNew,
    isMale,
    isFemale,
    isOther,
  });
});

router.get("/checkPassword", async function (req, res) {
  var user = await accountModel.findByUsername(
    req.session.passport.user.username
  );
  if (user) {
    const result = bcrypt.compareSync(req.query.password, user.password);
    return res.json(result);
  }
  return res.json(false);
});

router.post("/profile", async function (req, res) {
  entity = {
    fullName: req.body.fullName,
    pseudonym: req.body.pseudonym,
    email: req.body.email,
    DOB: moment(req.body.DOB, "DD/MM/YYYY").format("YYYY-MM-DD"),
    gender: req.body.gender,
    phone: req.body.phone,
  };

  condition = {
    idAcc: req.session.passport.user.id,
  };

  await informationUserModel.update(entity, condition);

  var info = await informationUserModel.findByUsername(
    req.session.passport.user.username
  );
  var isExpired = false;
  var isNew = true;
  if (info.expiredPre.getYear() > 70) {
    isNew = false;
    isExpired = info.expiredPre <= Date.now();
  }
  info.expiredPre = moment(info.expiredPre, "YYYY-MM-DD hh:mm:ss").format(
    "DD-MM-YYYY hh:mm:ss"
  );

  var isMale = info.gender == "Nam";
  var isFemale = info.gender == "N???";
  var isOther = info.gender == "Kh??c";

  res.render("../views/account/profile", {
    layout: 'notTemplate',
    info,
    isWriter: req.session.passport.user.idRole === config.role.idWriter,
    isSubscriber: req.session.passport.user.idRole === config.role.idSubscriber,
    isExpired,
    isNew,
    isMale,
    isFemale,
    isOther,
  });
});

router.post("/confirmCode", function (req, res) {
  //X??a session code
  delete req.session.code;
  res.redirect("/account/updatePassword");
});

// router.get("/updatePassword", function (req, res) {
//   res.render("account/updatePassword", { layout: 'notTemplate' });
// });

// router.post("/updatePassword", async function (req, res) {
//   //Change password
//   entity = {
//     password: bcrypt.hashSync(
//       req.body.password,
//       config.authentication.saltRounds
//     ),
//   };
//   condition = {
//     username,
//   };
//   await accountModel.passwordChange(entity, condition);
//   //X??a session user
//   delete req.session.username;

//   if (req.isAuthenticated()) res.redirect("/account/profile");
//   else res.redirect("/account/login");
// });

// router.get("/profile", async function (req, res) {
//   var info = await informationUserModel.findByUsername(
//     req.session.passport.user.username
//   );
//   res.render("account/profile", {
//     layout: 'notTemplate',
//     info,
//     isWriter: req.session.passport.user.idRole === config.role.idWriter,
//   });
// });

// router.get("/checkPassword", async function (req, res) {
//   var user = await accountModel.findByUsername(
//     req.session.passport.user.username
//   );
//   if (user) {
//     const result = bcrypt.compareSync(req.query.password, user.password);
//     return res.json(result);
//   }
//   return res.json(false);
// });

// router.post("/profile", async function (req, res) {
//   entity = {
//     fullName: req.body.fullName,
//     pseudonym: req.body.pseudonym,
//     email: req.body.email,
//     DOB: moment(req.body.DOB, "DD/MM/YYYY").format("YYYY-MM-DD"),
//     gender: req.body.gender,
//     phone: req.body.phone,
//   };

//   condition = {
//     idAcc: req.session.passport.user.id,
//   };

//   await informationUserModel.update(entity, condition);
//   var info = await informationUserModel.findByUsername(
//     req.session.passport.user.username
//   );
//   res.render("account/profile", {
//     layout: 'notTemplate',
//     info,
//     isWriter: req.session.passport.user.idRole === config.role.idWriter,
//   });
// });

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get("/permission", restrict ,async function (req, res) {
  var acc = await accountModel.findByID(+req.session.passport.user.id);
  if (acc.idRole == config.role.idWriter) {
    res.redirect("/writer/list_article");
  } else if (acc.idRole == config.role.idEditor) {
    res.redirect("/editor/draft");
  } else if (acc.idRole == config.role.idAdmin) {
    res.redirect("/admin/users");
  }
});

module.exports = router;
