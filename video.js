let cookieString = document.cookie;
let videoId =  cookieString.split("=")[1];
const apiKey = localStorage.getItem("api_key")

let firstScript = document.getElementsByTagName("script")[0] ;

firstScript.addEventListener("load", onLoadScript)

function onLoadScript() {
  if (YT) {
    new YT.Player("hitesh", {
      height: "500",
      width: "850",
      videoId,
      events: {
        onReady: (event) => {
            document.title = event.target.videoTitle ;
             extractVideoDetails(videoId);
            fetchStats(videoId)
        }
      }
    });
  }
}

const statsContainer = document.getElementsByClassName("video-details")[0];

async function extractVideoDetails(videoId){ 
    let endpoint = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`;

    try {
        let response = await fetch(endpoint);
        let result = await response.json();
        // console.log(result, "comments")
        renderComments(result.items);
    }
    catch(error){
        console.log(`Error occured`, error)
    }
    
}

function getNumber(n){
    if(n < 1000) return n ;
    else if ( n >= 1000 && n <= 999999){
        n /= 1000;
        n = parseInt(n)
        return n+"K" ;
    }
    return parseInt(n / 1000000) + "M" ;
}

function getMonth(n){
    let arr=["Jan","Feb","March","Apr","May","Jun","July","Aug","Sep","Oct","Nov","Dec"];
    return arr[n-1];
}
  
  let totalCommentCount;

async function  fetchStats(videoId){

    let endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${apiKey}&id=${videoId}`;
    let descriptionText, viewCount;
    let year, month, day;
    try {
        const response = await fetch(endpoint);
        const result = await response.json();
        // console.log(result);
        const item = result.items[0] ;
        const channelId= result.items[0].snippet.channelId;

        totalCommentCount= result.items[0].statistics.commentCount;

        //Extracting Description to video
        descriptionText= result.items[0].snippet.description;
        let descriptionContent= descriptionText.substring(0,316);
        let extraDescriptionContent;
        if(descriptionText.length>315){
                extraDescriptionContent= descriptionText.substring(316);
        }
        //Extracting viewCount to the video
        viewCount=result.items[0].statistics.viewCount;

        let endpoint2= `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`;

        let subscriberCount;
        let channelLogo;
        let publishedDate;
    try{
    let response1= await  fetch(endpoint2);
    let result1= await  response1.json();

    //extracting subscribers count
      subscriberCount=result1.items[0].statistics.subscriberCount;

      //extracting channel logo
      channelLogo=result1.items[0].snippet.thumbnails.default.url;

      //extracting publlished date
      publishedDate= result1.items[0].snippet.publishedAt;
      publishedDate=publishedDate.split("T")[0];
      year=publishedDate.split("-")[0];
      month=publishedDate.split("-")[1];
      day=publishedDate.split("-")[2];
    //   console.log(publishedDate)

    } catch(error){
        alert("Something went wrong",error);
    }

        const title = document.getElementById("title");
        title.innerText = item.snippet.title ;
        title.style.color = "white";
        title.style.fontSize = "20px"
        statsContainer.innerHTML = `
        <div class="profile">
                <img  src="${channelLogo}" class="channel-logo" alt="">
                <div class="owner-details">
                    <span style="color: white ">${item.snippet.channelTitle}</span>
                    <span>${getNumber(subscriberCount)} subscribers</span>
                </div>
        </div>
        <button id="subscriber-btn">Subscribe</button>
        <div class="stats">
            <div class="like-container">
                <div class="like">
                    <span class="material-icons">thumb_up</span>
                    <span>${item.statistics.likeCount}</span>
                </div>
                <span class="divide">|</span>
                <div class="like">
                    <span class="material-icons">thumb_down</span>
                </div>
            </div>
            <div class="comments-container">
                <span class="material-icons">comment</span>
                <span>${item.statistics.commentCount}</span>
            </div>
        </div>
        `
    const description=document.getElementById("description-container");

    description.innerHTML=`
    <div class="views-date">
    <span class="views">
      ${viewCount} views </span>
    <span class="date">
      ${getMonth(month)} ${day}, ${year}
    </span>
  </div>
  <div class="container">
    <span>${descriptionContent}</span>
    <span class="extra-content" id="extra"> ${extraDescriptionContent}</span>
    <button id="show-more-btn" onclick="loadContent()">Show more</button>
  </div>
    `
    }
    catch(error){
        console.log("error", error)
    }
}

function loadContent(){
    const extraContent=document.getElementById("extra");
    const showMore= document.getElementById("show-more-btn");

    if(extraContent.style.display==="none"){
        extraContent.style.display='inline';
        showMore.innerText= 'Show less';
    } else{
        extraContent.style.display='none';
        showMore.innerText= 'Show more';
    }
}


 
function renderComments(commentsList) {
    const commentsContainer = document.getElementById("comments-container"); 

    if(totalCommentCount){
    let commentCount = document.createElement("p");
        commentCount.className= "commentCount";
        // commentCount.style.color="white";
        commentCount.innerText=`${totalCommentCount} Comments`;
        commentsContainer.append(commentCount)
    }
    
    // commentsContainer.
    for(let i =  0; i < commentsList.length ; i++) {
        let comment = commentsList[i] ;
        const topLevelComment = comment.snippet.topLevelComment ;

        let commentElement = document.createElement("div");
        commentElement.className = "comment" ;
        commentElement.innerHTML = `
                <img src="${topLevelComment.snippet.authorProfileImageUrl}" alt="">
                <div class="comment-right-half">
                    <b>${topLevelComment.snippet.authorDisplayName
                    }</b>
                    <p>${topLevelComment.snippet.textOriginal}</p>
                    <div style="display: flex; gap: 20px">
                        <div class="like">
                            <span class="material-icons">thumb_up</span>
                            <span>${topLevelComment.snippet.likeCount}</span>
                        </div>
                        <div class="like">
                            <span class="material-icons">thumb_down</span>
                        </div>
                        <button class="reply" onclick="loadComments(this)" data-comment-id="${topLevelComment.id}">
                            Replies(${comment.snippet.totalReplyCount})
                        </button>
                    </div>
                </div>
            `;
        commentsContainer.append(commentElement);

    }
}

async function loadComments(element){
    const commentId = element.getAttribute("data-comment-id");
    console.log(commentId)
    let endpoint = `https://www.googleapis.com/youtube/v3/comments?part=snippet&parentId=${commentId}&key=${apiKey}`;
    try {
       const response =  await fetch(endpoint);
        const result = await response.json();
        const parentNode = element.parentNode.parentNode ;
        let commentsList = result.items ;
        for(let i = 0 ; i < commentsList.length ; i++) {
            let replyComment =  commentsList[i] ; 
            let commentNode = document.createElement("div");
            commentNode.className = "comment comment-reply";

            commentNode.innerHTML = `
                        <img src="${replyComment.snippet.authorProfileImageUrl}" alt="">
                        <div class="comment-right-half">
                            <b>${replyComment.snippet.authorDisplayName}</b>
                            <p>${replyComment.snippet.textOriginal}</p>
                            <div class="options">
                                <div class="like">
                                    <span class="material-icons">thumb_up</span>
                                    <span>${replyComment.snippet.likeCount}</span>
                                </div>
                                <div class="like">
                                    <span class="material-icons" onclick=>thumb_down</span>
                                </div>
                            </div>
                    `;

                parentNode.append(commentNode);
        }
    }   
    catch(error){

    }
}
