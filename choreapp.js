arrayShuffle = function(arr){
  var rand;
  var tmp;
  var len = arr.length;
  var ret = arr.slice();
  while (len) {
    rand = Math.floor(Math.random() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
}

Members = new Meteor.Collection("members");
Activities = new Meteor.Collection("activities");

addMember = function(name, email){
  return Members.insert({ name: name, email: email });
  assignActivitiesRandomly();
};

removeMember = function(id){
  return Members.remove({ _id: id });
  assignActivitiesRandomly();
};

addActivity = function(name){
  return Activities.insert({ name: name });
  assignActivitiesRandomly();
};

removeActivity = function(id){
  return Activities.remove({ _id: id });
  assignActivitiesRandomly();
};

assignActivitiesRandomly = function(){
  console.log("assignActivitiesRandomly");
  var members = arrayShuffle( Members.find({}).fetch({}) );
  var activities = arrayShuffle( Activities.find({}).fetch({}) );
  console.log("»»»»", activities );
  members.forEach( function(member,index){
    console.log("»»",index, activities[index], activities[index]);
    if(activities[index] !== undefined ){
      console.log("?");
      Members.update( {_id:member._id},  {$set: {activity: activities[index].name}});
    }else{
      Members.update( {_id:member._id}, {$set: {activity: "Free" }});
    }
  });
  sendEmail();
};

sendEmail = function(){
  Meteor.call("sendEmail");
};

if (Meteor.isClient) {

  Template.member_list.members = function(){
      var members = Members.find({});
      console.log("members",members);
      return members;
  };

  Template.activity_list.activities = function(){
      return Activities.find({});
  };

  Template.member.events({
    'click .remove': function(e,t) {
      removeMember(this._id);
    }
  });

  Template.activity.events({
    'click .remove': function(e,t) {
      removeActivity(this._id);
    }
  });

  Template.addMemberForm.events({
    'click #add-member': function(e,t) {
      var name = t.find('#member-name').value,
          email = t.find('#member-email').value;
      addMember(name,email);
    }
  });

  Template.addActivityForm.events({
    'click #add-activity': function(e,t) {
      var name = t.find('#activity-name').value;
      addActivity(name);
      assignActivitiesRandomly();
    }
  });

  Template.footer.events({
    'click button': function(e,t) {
      assignActivitiesRandomly();
    }
  })
}

if (Meteor.isServer) {
    process.env.MAIL_URL="smtp://madeofpeople@mail.mayfirst.org:465/";
  Meteor.methods({
    sendEmail: function(){
      Email.send({
        from: "thiago@madeofpeople.org",
        to: "elrojo@madeofpeople.org",
        subject: "Meteor Can Send Emails via Gmail",
        html: "<h1>Wow!</h2>Its pretty easy to send emails via mayfirst.org."
      });
    }
  });
}
