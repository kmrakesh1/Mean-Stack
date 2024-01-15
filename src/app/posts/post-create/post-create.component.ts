import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Post } from '../post.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { mimeType } from './mime-type.validator'
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit , OnDestroy {
  constructor(
    public postService: PostService, 
    public route: ActivatedRoute,
    public authService: AuthService,
    public router: Router) {}

  enteredTitle = '';
  enteredContent = '';
  post: Post;
  imagePreview: any;
  private mode = 'create';
  private postId: string;
  private authStatusSubs : Subscription;
  isLoading = false;
  form: FormGroup;


  // @Output() postCreated = new EventEmitter<Post>();
  ngOnInit() {
    this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(authStatus => {
      this.isLoading = false;
    });
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators:[mimeType] })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
      }
    });
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    // const post: Post= {
    //   title: form.value.title,
    //   content: form.value.content
    //  };
    //  this.postCreated.emit(post)
    this.isLoading = true;
    if (this.mode == 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      if (this.form.dirty) {
      this.postService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
      }
      else {
        this.router.navigate(['/']);
      }
    }

    this.form.reset();
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image : file});
    this.form.get('image').updateValueAndValidity();
    const reader =new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
  ngOnDestroy() {
    this.authStatusSubs.unsubscribe();
  }
}
