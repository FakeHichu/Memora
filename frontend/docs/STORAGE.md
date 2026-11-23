# Storage model

## Bucket

Bucket name: `class-photos`

The bucket is intentionally private and should never be made public.

## Object structure

```text
class-photos/
  {class_id}/
    {year}/
      {month}/
        {day}/
          {user_id}/
            {uuid}.jpg
```

## Delivery flow

1. Authenticate the user.
2. Verify that the user belongs to the class.
3. Retrieve the photo path from the post record.
4. Generate a short-lived signed URL.
5. Show the signed URL only to the authorized member.

## Security requirements

- Default signed URL lifetime: 5 minutes.
- Reject unsupported file types and oversized files.
- Strip EXIF metadata before upload when processing images.
- Validate upload path ownership and class membership.

## Future implementation

This foundation introduces the private storage strategy and the required bucket path pattern. The actual upload pipeline and signed URL service must be implemented once the project moves into the storage phase.
