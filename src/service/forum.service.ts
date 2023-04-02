import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, Activitylist, Article, Comment } from '../entity/forum';

// interface commentList {
//   [propName: string]: any
// }

@Provide()
export class ForumService {
  @InjectEntityModel(Article)
  articleModel: Repository<Article>;

  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(Activitylist)
  activitylistModel: Repository<Activitylist>;

  // find all ariticles
  async findAriticles() {
    let allArticle = await this.articleModel.find({});
    console.log("All photos from the db: ", allArticle);
  }

  // find user draft
  async findDraft(userID: number) {
    let draft = await this.articleModel.find({
      where: {
        userID: userID,
        // state: 1,
      }
    })
    console.log('there are draft: ', draft)
    return draft
  } 

  async findDrafting() {
    let draft = await this.articleModel.find({
      where: {
        // userID: userID,
        state: 1,
      }
    })
    console.log('there are draft: ', draft)
    return draft
  } 

  async findPubing() {
    let draft = await this.articleModel.find({
      where: {
        // userID: userID,
        state: 3,
      }
    })
    console.log('there are draft: ', draft)
    return draft
  } 

  // add articles
  async saveArticle(context: string, userID: number, title: string, state: number) {
    let article = new Article();
    article.state = state;
    article.title = title;
    article.userID = userID;
    article.context = context;
    article.collect = 0;
    article.looks = 0;
    article.light = 0;

    // save entity
    const articleResult = await this.articleModel.save(article);

    // save success
    console.log('article id = ', articleResult.articleID);
  }

  async pubArticle(articleID: number) {
    let stateUpdate = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });
    stateUpdate.state = 1;

    await this.articleModel.save(stateUpdate);

    console.log('article state =', stateUpdate.articleID);
  }

  async refuseArticle(articleID: number) {
    let stateUpdate = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });
    stateUpdate.state = 2;

    await this.articleModel.save(stateUpdate);

    console.log('article state =', stateUpdate.articleID);
  }

  async pubingArticle(articleID: number) {
    let stateUpdate = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });
    stateUpdate.state = 3;

    await this.articleModel.save(stateUpdate);

    console.log('article state =', stateUpdate.articleID);
  }

  async deleteArticle(articleID: number) {
    const photo = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });

    // 删除单个
    const deleteArticle = await this.articleModel.remove(photo);
    return deleteArticle
  }

  //点赞
  async lightArticle(articleID: number) {
    const article = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });
    article.light = article.light + 1
    await this.articleModel.save(article);

    console.log('lighted article:', article);
    return article
  }

  //收藏
  async collectArticle(articleID: number) {
    const article = await this.articleModel.findOne({
      where: {
        articleID: articleID,
      },
    });
    article.collect = article.collect + 1
    await this.articleModel.save(article);

    console.log('lighted article:', article);
    return article
  }

  // 一级comment
  async addFirstComment(articleID: number, context: string, userID: number, userName: string) {
    let comment = new Comment();
    comment.articleID = articleID;
    comment.context = context;
    comment.userID = userID;
    comment.tarcomID = -1;
    comment.userName = userName;

    // save entity
    const commentResult = await this.commentModel.save(comment);

    // save success
    console.log('comment id = ', commentResult.comID);
  }

  // 二、三级comment
  async addSecondComment(tarcomID: number, context: string, userID: number, userName: string) {
    let comment = new Comment();
    comment.articleID = -1;
    comment.context = context;
    comment.userID = userID;
    comment.tarcomID = tarcomID;
    comment.userName = userName;

    // save entity
    const commentResult = await this.commentModel.save(comment);

    // save success
    console.log('comment id = ', commentResult.comID);
  }

  //删除comment
  async deleteComment(comID: number) {
    let comment = await this.commentModel.find({
      where: {
        comID: comID,
      }
    })

    await this.commentModel.remove(comment)
    return comment
  }

  async findFirstComment(articleID: number) {
    let comment = await this.commentModel.find({
      where: {
        // userID: userID,
        articleID: articleID,
      }
    })
    console.log('there are comments: ', comment)
    return comment
  }

  //二级/三级comment
  async addOtherComment(articleID: number, context: string, userID: number, tarcomID: number) {
    let comment = new Comment();
    comment.articleID = null;
    comment.context = context;
    comment.userID = userID;
    comment.tarcomID = tarcomID;

    // save entity
    const commentResult = await this.commentModel.save(comment);

    // save success
    console.log('comment id = ', commentResult.comID);
  }

  // find all comments
  // async findComments(articleID: number) {

  //   let comments : commentList;
  //   comments.firstcom = await this.commentModel.find({
  //     where: {
  //       articleID: articleID,
  //     }
  //   });

  //   //循环一级评论
  //   for (const key in comments.firstcom) {
  //     comments.firstcom[key].secondcom = await this.commentModel.find({
  //       where: {
  //         tarcomID: Equal(comments.firstcom[key].comID)
  //       }
  //     })

  //     //循环二级评论
  //     for (const seckey in comments.firstcom[key].secondcom) {
  //       let thirdcom = [];
  //       const getThirdCom = async (id: number) => {
  //         const result = this.commentModel.find({
  //           where: {
  //             tarcomID: Equal(comments.firstcom[key].secondcom[seckey].comID)
  //           }
  //         })
  //         if(!result) return;
  //         for(const item of await result) {
  //           thirdcom.push(item)
  //           await getThirdCom(item.comID)
  //         }
  //       }
  //       getThirdCom(comments.firstcom[key].secondcom[seckey].comID);
  //       comments.firstcom[key].secondcom[seckey].thirdcom = thirdcom;
  //     }  
  //   }
  //   console.log("All comments are", comments);
  // }

  //导出评论表
  async findComments(){
    let allcomments = await this.commentModel.find({});

    return allcomments
  }

  async saveActivity(actvname: string, actvaddr: string, actvtime: string, actvduration: number, actvtext: string, leaderID: number, leadername: string, leadertel: string, needp: number) {
    let activity = new Activity();
    activity.state = 0;
    activity.actvname = actvname;
    activity.actvaddr = actvaddr;
    activity.actvtime = actvtime;
    activity.actvduration = actvduration;
    activity.actvtext = actvtext;
    activity.leaderID = leaderID;
    activity.leadername = leadername;
    activity.leadertel = leadertel;
    activity.needp = needp

    // save entity
    const activityResult = await this.activityModel.save(activity);

    // save success
    console.log('activity id = ', activityResult.actvid);
  }

  async findActivity(leaderID: number) {
    let actv = await this.activityModel.find({
      where: {
        leaderID: leaderID,
        // state: 1,
      }
    })
    return actv
  } 

  async pubActivity(actvid: number) {
    let stateUpdate = await this.activityModel.findOne({
      where: {
        actvid: actvid,
      },
    });
    stateUpdate.state = 1;

    await this.activityModel.save(stateUpdate);

    console.log('activity state =', stateUpdate.actvid);
  }

  async deleteActivity(actvid: number) {
    const actv = await this.activityModel.findOne({
      where: {
        actvid: actvid,
      },
    });

    // 删除单个
    const deleteArticle = await this.activityModel.remove(actv);
    return deleteArticle
  }

  async refuseActivity(actvid: number) {
    let stateUpdate = await this.activityModel.findOne({
      where: {
        actvid: actvid,
      },
    });
    stateUpdate.state = 2;

    await this.activityModel.save(stateUpdate);

    console.log('article state =', stateUpdate.actvid);
  }

  async pubingActivity(actvid: number) {
    let stateUpdate = await this.activityModel.findOne({
      where: {
        actvid: actvid,
      },
    });
    stateUpdate.state = 3;

    await this.activityModel.save(stateUpdate);

    console.log('article state =', stateUpdate.actvid);
  }

  async findactvDrafting() {
    let draft = await this.activityModel.find({
      where: {
        // userID: userID,
        state: 1,
      }
    })
    return draft
  } 

  async findactvPubing() {
    let actv = await this.activityModel.find({
      where: {
        // userID: userID,
        state: 3,
      }
    })
    return actv
  } 

  //志愿者报名活动，alreadyp人数加1
  async volSignUp(actvid: number) {
    let actv = await this.activityModel.findOne({
      where: {
        actvid: actvid,
      }
    })

    actv.alreadyp = actv.alreadyp + 1;

    await this.activityModel.save(actv);

    return actv
  } 

  async saveActivityList(actvid: number, menberID: number, menbername: string, menbertel: string) {
    let activityList = new Activitylist();
    activityList.actvID = actvid,
    activityList.menberID = menberID,
    activityList.menbername = menbername,
    activityList.menbertel = menbertel

    // save entity
    const activityListResult = await this.activitylistModel.save(activityList);

    // save success
    console.log('activityList id = ', activityListResult.actvID);
  }

  async findUseractv(leaderID: number) {
    let actv = await this.activityModel.find({
      where: {
        leaderID: leaderID,
        state: 3
      }
    })
    return actv
  } 

  async findUseractvlist(actvID: number) {
    let actvlist = await this.activitylistModel.find({
      where: {
        actvID: actvID
      }
    })
    return actvlist
  } 
}
