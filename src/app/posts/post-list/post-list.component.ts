import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //     {title: "First Post", content: "This is first post's conent"},
  //     {title: "Second Post", content: "This is second post's conent"},
  //     {title: "Third Post", content: "This is third post's conent"}
  // ];
  constructor(public postService: PostService, private authService: AuthService) {}
  //  @Input() posts: Post[] = [];
  posts: Post[] = [];
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  userId: string;
  userIsAuthenticated = false;
  isLoading = false;
  totalPost = 0;
  postPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];

  onDelete(postid: string) {
    this.postService.deletePost(postid).subscribe(()=>{
      this.postService.getPosts(this.postPerPage, this.currentPage)
    });
  }
  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postService
      .getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount}) => {
        this.isLoading = false;
        this.totalPost = postData.postCount;
        this.posts = postData.posts;
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
           this.userIsAuthenticated = isAuthenticated;
           this.userId = this.authService.getUserId();
      });
  }
  onChangePage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postService.getPosts(this.postPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
